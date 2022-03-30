/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useState} from 'react';
import {StyleSheet, Text, TouchableWithoutFeedback, View} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolateColor,
} from 'react-native-reanimated';

const COLORS = {
  DEFAULT: '#21223E',
  LOADED: '#4B4F93',
  SUCCESS: '#0C8D87',
  ERROR: '#C01332',
  TEXT: '#FFFFFF',
};

const SuccessText = () => <Text style={styles.text}>Success</Text>;

const ErrorText = () => <Text style={styles.text}>Error</Text>;

const DefaultText = () => <Text style={styles.text}>Submit</Text>;

const RenderText = ({status}: {status: string}) => {
  switch (status) {
    case 'success':
      return <SuccessText />;
    case 'error':
      return <ErrorText />;
    default:
      return <DefaultText />;
  }
};

const App = () => {
  const progressValue = useSharedValue(0);
  const statusValue = useSharedValue('default');
  const [requestResult, setRequestResult] = useState('default');

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progressValue.value}%`,
      height: 60,
      backgroundColor: interpolateColor(
        progressValue.value,
        [0, 99, 100],
        [
          COLORS.LOADED,
          COLORS.LOADED,
          statusValue.value === 'success' ? COLORS.SUCCESS : COLORS.ERROR,
        ],
      ),
    };
  });

  const buttonStyle = useAnimatedStyle(() => {
    return {
      width: 213,
      height: 60,
      borderRadius: 8,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: interpolateColor(
        progressValue.value,
        [0, 99, 100],
        [
          COLORS.DEFAULT,
          COLORS.LOADED,
          statusValue.value === 'success' ? COLORS.SUCCESS : COLORS.ERROR,
        ],
      ),
    };
  });

  const handleSubmit = async () => {
    const payments = await getPayments();
    await getPayment(payments.id);
  };

  const getPayments = async () => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'foobar',
        amount: 100,
      }),
    };
    const response = await fetch(
      'https://europe-west1-interview-api-33b9a.cloudfunctions.net/api/payments',
      options,
    );
    return response.json();
  };

  const getPayment = async (payment: string) => {
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    try {
      const url = `https://europe-west1-interview-api-33b9a.cloudfunctions.net/api/payments/${payment}`;
      const response = await fetch(url, options);
      const data = await response.json();
      if (data.progress < 100) {
        progressValue.value = data.progress;
        setTimeout(async () => {
          return getPayment(payment);
        }, 1000);
      } else {
        progressValue.value = data.progress;
        statusValue.value = 'success';
        setRequestResult('success');
        return data;
      }
    } catch (error) {
      statusValue.value = 'error';
      setRequestResult('success');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={handleSubmit}>
        <Animated.View style={[buttonStyle]}>
          <View style={StyleSheet.absoluteFill}>
            <Animated.View style={[progressStyle]} />
          </View>
          <RenderText status={requestResult} />
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  text: {
    // fontFamily: 'Lato',
    fontStyle: 'normal',
    // fontWeight: '900',
    fontSize: 24,
    lineHeight: 29,
    textTransform: 'uppercase',
    color: COLORS.TEXT,
  },
});

export default App;
