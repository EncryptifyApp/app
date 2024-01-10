import { View, TextInput, Text, Image, TextInputKeyPressEventData, NativeSyntheticEvent } from 'react-native';
import { useSession } from '../context/useSession';
import Button from '../components/Button';
import React, { createRef, useRef, useState } from 'react';
import PhoneInput from 'react-native-phone-number-input';
import { useAuthenticateMutation, useSendVerificationCodeMutation, useValidateVerificationCodeMutation } from '../generated/graphql';
import { router } from 'expo-router';
import { toast } from "@backpackapp-io/react-native-toast"
import { NotificationStyle, PRIVATE_KEY } from '../constants';
import { generateKeyPair } from '../utils/crypto';
import { encode } from '@stablelib/base64';
import { setStorageItemAsync } from '../utils/useStorageState';

type AuthStep = 'INPUT_PHONE_NUMBER' | 'INPUT_CODE' | 'INPUT_USERNAME';


export default function Auth() {
  const { authenticateUser } = useSession() || { session: null, isLoading: true };
  const [step, setStep] = useState<AuthStep>('INPUT_PHONE_NUMBER');
  const [token, setToken] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [countryCode, setCountryCode] = useState<string[]>(['+1']);
  const [username, setUsername] = useState<string>('');
  //verification code
  const inputRefs = useRef<Array<TextInput | null>>(
    Array.from({ length: 6 }).map(() => createRef<TextInput | null>().current)
  );

  const [code, setCode] = useState<string[]>(Array(6).fill(''));


  const handleCodeChange = (text: string, index: number) => {
    setCode((prevCode) => {
      const newCode = [...prevCode];
      newCode[index] = text;

      if (text && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }

      return newCode;
    });
  };

  const handleKeyPress = (event: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (event.nativeEvent.key === 'Backspace' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };


  const phoneInput = useRef<PhoneInput>(null);

  const [, sendVerificationCode] = useSendVerificationCodeMutation();
  const [, validateVerificationCode] = useValidateVerificationCodeMutation();
  const [, authenticate] = useAuthenticateMutation();

  const Send = async () => {
    const checkValid = phoneInput.current?.isValidNumber(phoneNumber);
    if (!checkValid) {
      throw new Error('Invalid number');
    }
    try {
      const isValidNumber = phoneInput.current?.isValidNumber(phoneNumber);

      if (!isValidNumber) {
        throw new Error('Invalid phone number');
      }

      setLoading(true);

      const response = await sendVerificationCode({
        phoneNumber: phoneNumber,
        countryCode: '+' + countryCode[0],
      });
     
      if (response.data?.sendVerificationCode.error) {
        throw new Error(response.data?.sendVerificationCode.error.message);
      }

      if (response.data?.sendVerificationCode.token) {
        setToken(response.data?.sendVerificationCode.token);
        setStep('INPUT_CODE');
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
      throw new Error('Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const VerifyCode = async () => {
    try {
      setLoading(true);

      const response = await validateVerificationCode({
        registrationToken: token,
        code: code.join(''),
      });

      if (response.data?.validateVerificationCode.error) {
        return new Error(response.data?.validateVerificationCode.error.message);
      }

      if (response.data?.validateVerificationCode.token) {
        setToken(response.data?.validateVerificationCode.token);
        setStep('INPUT_USERNAME');
      }
    } catch (error) {
      console.error('Error validating verification code:', error);
      // Handle or log the error as needed
      throw new Error('Failed to validate verification code');
    } finally {
      setLoading(false);
    }
  };

  const Authenticate = async () => {
    try {
      if (username.length < 3) {
        throw new Error('The username you entered is too short.');
      }
      setLoading(true);
      //generate Keypair
      const pair = generateKeyPair();
      //converting the public key to string
      const base64String = encode(pair.publicKey);

      const response = await authenticate({
        registrationToken: token,
        username: username,
        publicKey: base64String
      });

      if (response.data?.authenticate.error) {
        throw new Error(response.data?.authenticate.error.message);
      }

      if (response.data?.authenticate.sessionToken) {
        setStorageItemAsync(PRIVATE_KEY, pair.secretKey.toString());
        //@ts-ignore
        authenticateUser(response.data.authenticate.sessionToken);
        router.replace('/');
      }
    } catch (error) {
      console.error('Error in Authenticate function:', error);
      // Handle or log the error as needed
      throw new Error('Authentication failed');
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      {step === 'INPUT_PHONE_NUMBER' && (
        <View className='flex-1 items-center justify-center px-8 bg-midnight-black space-y-20'>
          <Image
            source={require('../assets/favicon.png')}
            className='w-10 h-10 mb-5'
          />
          <View className='flex flex-row justify-center my-5 text-white'>
            <PhoneInput
              ref={phoneInput}
              
              defaultCode="US"
              layout="first"
              onChangeText={(text) => setPhoneNumber(text)}
              onChangeCountry={(code) => setCountryCode(code.callingCode)}
              textInputStyle={{ color: 'white' }}
              textContainerStyle={{ backgroundColor: '#191b1f', borderRadius: 5 }}
              codeTextStyle={{ color: 'white' }}
              containerStyle={{ borderRadius: 5, backgroundColor: '#191b1f' }}
              withDarkTheme
            />
          </View>
          <Button
            text='Send Code'
            textColor='black'
            bgColor='primary'
            width='full'
            loading={loading}
            size='large'
            weight='semibold'
            disabled={
              !phoneInput.current?.isValidNumber(phoneNumber)
            }
            onPress={() => {
              const promise = Send();
              toast.promise(promise, {
                loading: 'Sending...',
                success: "SMS Sent",
                error: (err) => err.toString(),
              }, { styles: NotificationStyle })
            }}
          />

        </View>
      )}
      {
        step === "INPUT_CODE" && (
          <View className='flex-1 justify-center items-center px-6 bg-midnight-black space-y-10'>
            <Text className='text-lg mb-4 text-white font-primary-medium text-center'>Enter the six digit code that we sent to this number: {countryCode} {phoneNumber}</Text>

            <View className='flex flex-row mb-8'>
              {[...Array(6).keys()].map((index) => (
                <TextInput
                  className='w-10 h-12 text-center border-2 rounded-md text-2xl bg-steel-gray border-steel-gray text-white mx-2'
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  value={code[index]}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  onKeyPress={(event) => handleKeyPress(event, index)}
                  autoFocus={index === 0}
                />
              ))}
            </View>

            <Button
              text='Verify'
              textColor='black'
              bgColor='primary'
              width='full'
              size='large'
              loading={loading}
              weight='semibold'
              onPress={() => {
                const promise = VerifyCode()
                toast.promise(promise, {
                  loading: 'Verifying...',
                  success: "Code Verified",
                  error: (err) => err.toString(),
                }, { styles: NotificationStyle })
              }}
            />
          </View>
        )
      }

      {
        step === "INPUT_USERNAME" && (
          <View className='flex-1 justify-center items-center px-6 bg-midnight-black space-y-10'>
            <Text className='text-lg mb-4 text-white font-primary-medium text-center'>Enter a username</Text>

            <View className='flex flex-row mb-8'>
              <TextInput
                placeholder='username'
                placeholderTextColor="#FFF"
                className='w-full p-2 text-white border-2 font-primary-medium rounded-md text-xl bg-steel-gray border-steel-gray placeholder-slate-100 mx-2'
                autoFocus={true}
                onChangeText={(text) => setUsername(text)}
              />
            </View>

            <Button
              text='Confirm'
              textColor='black'
              bgColor='primary'
              width='full'
              size='large'
              loading={loading}
              weight='semibold'
              onPress={() => {
                const promise = Authenticate();
                toast.promise(promise, {
                  loading: 'signing you in...',
                  success: "Signed In",
                  error: (err) => err.toString(),
                }, { styles: NotificationStyle })
              }}
            />
          </View>
        )
      }


    </>
  );
}
