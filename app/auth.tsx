import { View, TextInput, Text, Image, TouchableOpacity, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useSession } from '../context/useSession';
import Button from '../components/Button';
import React, { useEffect, useState } from 'react';
import { useAuthenticateMutation, useFindAccountQuery } from '../generated/graphql';
import { PRIVATE_KEY } from '../constants';
import { decryptPrivateKey, encryptPrivateKey, generateKeyPair } from '../utils/crypto';
import { encode } from '@stablelib/base64';
import { Feather } from '@expo/vector-icons';
import { setStorageItemAsync } from '../utils/useStorageState';
import { router } from 'expo-router';
import { generatePhrase } from '../utils/generatePhrase';

type AuthStep = 'INPUT_ACCOUNT_NUMBER' | 'CREATE_PASSPHRASE' | 'INPUT_PASSPHRASE' | 'INPUT_USERNAME';


export default function Auth() {
  const { authenticateUser } = useSession() || {
    authenticateUser: async (sessionToken: string) => { }
  }
  const [step, setStep] = useState<AuthStep>('INPUT_ACCOUNT_NUMBER');
  const [loading, setLoading] = useState<boolean>(false);

  //licenseKey
  const [licenseKey, setLicenseKey] = useState<string>('');
  const [result, reexecuteQuery] = useFindAccountQuery({ variables: { licenseKey: licenseKey }, pause: licenseKey === '' });

  //passphrase
  const [passphrase, setPassphrase] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [isPassphraseCopied, setIsPassphraseCopied] = useState<boolean>(false);

  //keys
  const [publicKey, setPublicKey] = useState<string>('');
  const [, setPrivateKey] = useState<string>('');
  const [encryptedPrivateKey, setEncryptedPrivateKey] = useState<string>('');

  const [, authenticate] = useAuthenticateMutation();


  const formatLicenseKey = (text: string) => {
    // Remove any dashes and uppercase the input
    text = text.replace(/-/g, '').toUpperCase();

    // Insert dashes at specific positions
    let formattedKey = '';
    for (let i = 0; i < text.length; i++) {
      formattedKey += text[i];
      if ((i === 4 || i === 9) && i !== text.length - 1) {
        formattedKey += '-';
      }
    }
    return formattedKey;
  };

  const handleLicenseKeyChange = (text: string) => {
    if (text.length > 17) return;
    const formattedKey = formatLicenseKey(text);
    setLicenseKey(formattedKey);
  };


  const FindLicense = async () => {
    
    if (licenseKey === '' || licenseKey.length != 17) {
      Alert.alert('Not a valid number', 'Enter a valid number', [
        {
          text: 'Close',
          onPress: () => { },
          style: 'cancel',
        },
      ]);
      return;
    }
    try {
      setLoading(true);
      reexecuteQuery();
      const { data } = result;
      
      if (data?.findAccount.error) {
        Alert.alert('Error', data.findAccount.error.message, [
          {
            text: 'Close',
            onPress: () => { },
            style: 'cancel',
          },
        ]);
      }
      if (data?.findAccount.user) {
        if (data.findAccount.user.encryptedPrivateKey === null) {
          setStep('CREATE_PASSPHRASE');
        }
        else {
          setUsername(data.findAccount.user.username!);
          setPublicKey(data.findAccount.user.publicKey!);
          setEncryptedPrivateKey(data.findAccount.user.encryptedPrivateKey!);
          setStep('INPUT_PASSPHRASE');
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occured, try again later', [
        {
          text: 'Close',
          onPress: () => { },
          style: 'cancel',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };


  const generateKeys = async () => {
    if (passphrase.trim().split(/\s+/).length < 3) {
      return
    }
    try {
      //generate Keypair
      const pair = generateKeyPair();
      //converting the public key to string
      const base64String = encode(pair.publicKey);
      const privateKey = pair.secretKey.toString();
      setStorageItemAsync(PRIVATE_KEY, privateKey);
      //encrypt the private key with the passphrase
      const encryptedPrivateKey = encryptPrivateKey(privateKey, passphrase);

      setPublicKey(base64String);
      setPrivateKey(privateKey);
      setEncryptedPrivateKey(encryptedPrivateKey);

      setStep('INPUT_USERNAME');
    }
    catch (error) {
      Alert.alert('Error', 'An error occured, try again later', [
        {
          text: 'Close',
          onPress: () => { },
          style: 'cancel',
        },
      ]);
    }
  }

  const DecryptPrivateKeys = async () => {
    try {
      setLoading(true);
      //decrypt the private key with the passphrase
      const decryptedPrivateKey = decryptPrivateKey(encryptedPrivateKey, passphrase);
      if (decryptedPrivateKey === null || decryptedPrivateKey === "") {
        Alert.alert('Error', 'Invalid passphrase', [
          {
            text: 'Close',
            onPress: () => { },
            style: 'cancel',
          },
        ]);
        return
      } else {
        setStorageItemAsync(PRIVATE_KEY, decryptedPrivateKey.toString());
        setStep('INPUT_USERNAME');
      }
    }
    catch (error) {
      Alert.alert('Error', 'An error occured, try again later', [
        {
          text: 'Close',
          onPress: () => { },
          style: 'cancel',
        },
      ]);
    } finally {
      setLoading(false);
    }

  }

  const Authenticate = async () => {
    if (username.length < 3) {
      return
    }
    try {
      setLoading(true);
      const { data } = await authenticate({
        username: username,
        licenseKey: licenseKey,
        publicKey: publicKey,
        encryptedPrivateKey: encryptedPrivateKey
      });
      if (data?.authenticate.error) {
        Alert.alert('Error', data.authenticate.error.message, [
          {
            text: 'Close',
            onPress: () => { },
            style: 'cancel',
          },
        ]);
      }
      if (data?.authenticate.sessionToken) {
        authenticateUser(data.authenticate.sessionToken);
        router.replace('/')
      }
    }
    catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occured, try again later', [
        {
          text: 'Close',
          onPress: () => { },
          style: 'cancel',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    if (isPassphraseCopied) {
      setIsPassphraseCopied(false);
    }
  }, [passphrase]);


  return (
    <View className="flex-1 items-center justify-center px-8 bg-midnight-black space-y-20">
      {step === 'INPUT_ACCOUNT_NUMBER' && (
        <><Image
          source={require('../assets/images/logo.png')}
          className="w-24 h-24 mb-5" /><View className="flex flex-row justify-center my-5 text-white">
            <TextInput
              placeholder="License key"
              placeholderTextColor="gray"
              autoCapitalize='characters'
              className="w-full p-2 text-gray-200 border-2 font-primary-medium rounded-md text-lg bg-steel-gray border-steel-gray placeholder-slate-100 mx-2"
              value={licenseKey}
              onChangeText={handleLicenseKeyChange}
            />
          </View><Button
            text="Enter"
            textColor="black"
            bgColor="primary"
            width="full"
            loading={loading}
            size="large"
            weight="semibold"
            rounded='rounded-md'
            disabled={licenseKey.length !== 17}
            onPress={FindLicense} />
            {/* <DecryptingAnimation finalText="Decrypting Text..." duration={3000} /> */}
          <Text className="text-white text-base font-primary-medium text-center mt-8">If you do not have a license key, you can acquire one through our official website.</Text>
        </>

      )}
      {
        step === "CREATE_PASSPHRASE" && (
          <>
            <View className="flex flex-col justify-center space-y-5">
              <View className='space-y-5'>
                <Text className="text-white text-xl font-primary-bold text-center">Recovery phrase</Text>
                <Text className="text-white text-base font-primary-medium text-center">You can only recover your encryption keys with your recovery phrase so make sure to keep it private and safe</Text>
              </View>


              <View style={{ position: 'relative' }}>
                <TextInput
                  placeholder="Recovery phrase"
                  placeholderTextColor="#FFF"
                  className="w-full p-2 text-white border-2 mb-10 font-primary-medium rounded-md text-lg bg-steel-gray border-steel-gray placeholder-slate-100"
                  value={passphrase}
                  onChangeText={(text) => setPassphrase(text)}
                  multiline={true}
                  style={{ maxWidth: '100%', paddingRight: 40 }}
                  maxLength={150}
                />

                {passphrase && (
                  <TouchableOpacity
                    onPress={async () => {
                      if (passphrase) {
                        await Clipboard.setStringAsync(passphrase)
                          .then(() => {
                            setIsPassphraseCopied(true);
                          })
                      }
                    }}
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 8,
                    }}
                  >
                    {
                      isPassphraseCopied ? (
                        <Feather name="check" size={24} color="white" />
                      ) : (
                        <Feather name="copy" size={24} color="white" />
                      )
                    }
                  </TouchableOpacity>
                )}
              </View>

            </View>
            <View className="flex w-full space-y-4">
              <View>
                <Button
                  outline
                  text="Generate"
                  textColor="primary"
                  width="full"
                  size="large"
                  weight="semibold"
                  rounded='rounded-md'
                  onPress={() => {
                    generatePhrase().then((phrase) => {
                      setPassphrase(phrase);
                    });
                  }} />
              </View>

              <View>
                <Button
                  text="Save"
                  textColor="black"
                  bgColor="primary"
                  width="full"
                  loading={loading}
                  size="large"
                  weight="semibold"
                  rounded='rounded-md'
                  disabled={passphrase.trim().split(/\s+/).length < 3}
                  onPress={generateKeys} />
              </View>
            </View>

          </>
        )
      }


      {
        step === "INPUT_PASSPHRASE" && (
          <>
            <View className="flex flex-col justify-center space-y-5">
              <View className='space-y-5'>
                <Text className="text-white text-xl font-primary-bold text-center">Enter you Recovery phrase</Text>
                <Text className="text-white text-base font-primary-medium text-center">You can only recover your encryption keys with your recovery phrase.</Text>
              </View>



            </View>
            <View className="flex w-full space-y-5 mt-5">
              <View>

                <TextInput
                  placeholder="Recovery phrase"
                  placeholderTextColor="#FFF"
                  className="w-full p-2 text-white border-2 font-primary-medium rounded-md text-lg bg-steel-gray border-steel-gray placeholder-slate-100"
                  value={passphrase}
                  onChangeText={(text) => setPassphrase(text)}
                  multiline={true}
                  autoFocus={true}
                  maxLength={150}
                />
              </View>

              <View>
                <Button
                  text="Enter"
                  textColor="black"
                  bgColor="primary"
                  width="full"
                  loading={loading}
                  size="large"
                  weight="semibold"
                  rounded='rounded-md'
                  onPress={DecryptPrivateKeys} />
              </View>

            </View>

          </>
        )
      }

      {
        step === "INPUT_USERNAME" && (
          <>
            <View className="flex flex-col justify-center space-y-5">
              <View className='space-y-5'>
                <Text className="text-white text-xl font-primary-bold text-center">Complete your profile</Text>
              </View>
              {/* add profile pic and username input */}
              <View className="flex flex-col justify-center space-y-5">
                <View className="flex flex-row justify-center space-x-5">
                  <Image
                    source={require('../assets/images/logo.png')}
                    className="w-24 h-24 mb-5" />
                </View>
                <View className="flex flex-row justify-center space-y-5">
                  <TextInput
                    placeholder="Username"
                    value={username}
                    placeholderTextColor="#FFF"
                    className="w-full p-2 text-white border-2 font-primary-medium rounded-md text-lg bg-steel-gray border-steel-gray placeholder-slate-100 mx-2"
                    autoFocus={true}
                    onChangeText={(text) => setUsername(text)} />
                </View>
                <View>
                  <Button
                    text="Complete"
                    textColor="black"
                    bgColor="primary"
                    width="full"
                    loading={loading}
                    size="large"
                    weight="semibold"
                    rounded='rounded-md'
                    disabled={username.length < 3}
                    onPress={Authenticate} />
                </View>
              </View>


            </View>



          </>
        )
      }



      {/* privacy policy and terms and conditions links */}
      <View className="flex flex-col justify-center space-y-5">



        <View className="flex flex-row justify-center space-x-5">
          <Text className="text-primary font-primary-medium">Privacy Policy</Text>
          <Text className="text-primary font-primary-medium">Terms of Service</Text>
        </View>
      </View>
    </View>
  );
}