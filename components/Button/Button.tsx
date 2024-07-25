import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';

interface Props {
  text?: string;
  textColor?: string;
  bgColor?: string;
  size: "small" | "medium" | "large" | "xlarge";
  width: "full" | "half" | "most" | "min" | "xmin";
  weight?: "regular" | "normal" | "bold" | "semibold";
  rounded: "rounded-none" | "rounded-md" | "rounded-lg" | "rounded-xl" | "rounded-2xl" | "rounded-3xl" | "rounded-full";
  icon?: any;
  loading?: boolean;
  disabled?: boolean;
  onPress: any;
  outline?: boolean;
}

const backgroundColors = {
  primary: "bg-primary",
  black: "bg-black",
  red: 'bg-red-400',
  'midnight-black': "bg-midnight-black",
  'steel-gray': "bg-steel-gray",
};

const textColors = {
  primary: "text-primary",
  white: "text-white",
  black: "text-black",
  'midnight-black': "text-midnight-black",
  red: "text-red-700",
};

const sizes = {
  small: "px-0.5 py-0.5",
  medium: "px-1 py-1",
  large: "px-2 py-2",
  xlarge: "px-3 py-3",
};

const widths = {
  full: "w-full",
  half: "w-1/2",
  most: "w-3/4",
  min: "w-1/3",
  xmin: "w-1/12",
};

const weights = {
  regular: "font-primary-regular",
  normal: "font-primary-normal",
  bold: "font-primary-bold",
  semibold: "font-primary-semibold",
};

function getClassName(...classes: any) {
  return classes.filter(Boolean).join(' ');
}

export default function Button({
  text,
  textColor,
  bgColor,
  width,
  weight,
  rounded,
  size,
  loading,
  icon,
  onPress,
  disabled,
  outline,
}: Props) {
  let textColorClasses = textColors[textColor as keyof typeof textColors];
  let bgColorClasses = backgroundColors[bgColor as keyof typeof backgroundColors];
  let widthClasses = widths[width];
  let sizeClasses = sizes[size];
  let weightClasses = weights[weight as keyof typeof weights];

  let ActivityIndicatorColor = textColor == "primary" ? "#000000" : "#ffffff";

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      onPress={onPress}
      style={{
        borderWidth: outline ? 1 : 0,
        borderColor: outline ? textColorClasses : 'transparent',
      }}
      className={getClassName(
        'flex flex-row items-center justify-center',
        'shadow-sm capitalize',
        'text-center transition duration-800 ease-in-out transform',
        `${bgColorClasses}`,
        `${widthClasses}`,
        `${sizeClasses}`,
        `${textColorClasses}`,
        `${weightClasses}`,
        `${rounded}`,
        outline ? 'bg-transparent border-2 border-primary text-primary' : 'bg-opacity-100',
        disabled ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'
      )}
    >
      {icon && !loading && (
        <Text className={getClassName(`${textColorClasses}`)}>{icon}</Text>
      )}
      {loading ? (
        <ActivityIndicator color={ActivityIndicatorColor} />
      ) : (
        <Text className={getClassName(`${textColorClasses} ${weightClasses} uppercase text-base`)}>
          {text}
        </Text>
      )}
    </TouchableOpacity>
  );
}
