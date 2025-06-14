import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet, } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { Audio } from 'expo-av';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useRoute } from '@react-navigation/native';
import { Dimensions } from 'react-native';
import { Animated, Easing } from 'react-native';

import global from '../styles/global';


const { width, height } = Dimensions.get('window');


export default function TimerScreen({ navigation }) {
  const route = useRoute();
  const { taskName, roomId } = route.params;
  const [duration, setDuration] = useState(null); 
  const [remaining, setRemaining] = useState(null);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;


  
  useEffect(() => {
    let timer;
    if (started && remaining > 0) {
      timer = setTimeout(() => {
        setRemaining(prev => prev - 1);
      }, 1000);
    } else if (remaining === 0 && started) {
      handleComplete();
    }
    return () => clearTimeout(timer);
  }, [remaining, started]);

  const startTask = () => {
    if (duration > 0) {
      setRemaining(duration);
      setStarted(true);
    } else {
      setStarted(true); 
    }

  };


  useEffect(() => {
    if (started && duration === 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [started]);


  const handleComplete = async () => {
    setCompleted(true);
    setShowConfetti(true);    

    

    const { sound } = await Audio.Sound.createAsync(
      require('../assets/sounds/celebration.mp3')
    );
    await sound.playAsync();

    
    setTimeout(() => {
      setShowConfetti(false);
      navigation.goBack();
    }, 2000);
  };

  const formatTime = (sec) => {
    if (sec === null) return '--:--';
    const min = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${min.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  return (
    <View style={global.timerContainer}>
      <Text style={{ fontSize: 30, fontWeight:'bold', color:'#FFFFFF', marginBottom: 50 }}>{taskName}</Text>
           
      {!started ? (
        <>
          <Text style={{ margin: 30, fontSize: 25, fontWeight:'normal', color:'#535353' }}>Optional: Set a Timer</Text>
          
          <View style={global.timerButtons} >
          <TouchableOpacity style={global.timerBtn} onPress={() => setDuration(300)}>
            <Text style={global.timerBtnText}>5 min</Text>
          </TouchableOpacity>

          <TouchableOpacity style={global.timerBtn} onPress={() => setDuration(600)}>
            <Text style={global.timerBtnText}>10 min</Text>
          </TouchableOpacity>

          </View>

          <Text style={{ margin: 30, fontSize: 25, fontWeight:'normal', color:'#535353' }}>or</Text>

          <TouchableOpacity style={global.noTimerBtn} onPress={() => setDuration(0)}>
            <Text style={global.noTimerBtnText}>No Timer</Text>
          </TouchableOpacity>

          {duration !== null && (
            <TouchableOpacity onPress={startTask} style={global.startBtn}>
              <Text style={global.startBtnText}>Start Task</Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <>
          <Text style={global.timerLabel}>
            {duration !== 0 && (<Text style={global.timerLabel}>Time Remaining:</Text>
)}
          </Text>

          {duration === 0 ? (
            <View style={global.pulseContainer}>
              <Animated.View style={[global.pulseCircle, { transform: [{ scale: pulseAnim }] }]} />
              <Text style={global.focusText}>Focus Mode</Text>
            </View>
          ) : (
            <AnimatedCircularProgress
              size={200}
              width={15}
              fill={duration > 0 ? ((duration - remaining) / duration) * 100 : 0}
              tintColor="#f7bd50"
              backgroundColor="#58a3bc"
            >
              {() => (
                <Text style={global.time}>
                  {formatTime(remaining)}
                </Text>
              )}
            </AnimatedCircularProgress>
          )}



          <TouchableOpacity onPress={handleComplete} style={global.completeBtn}>
            <Text style={global.completeBtnText}>Complete</Text>
          </TouchableOpacity>
        </>
      )}

      {showConfetti && (
        <ConfettiCannon
          count={100}
          origin={{ x: width / 2, y: height * .25 }}
          fallSpeed={2000}           
          explosionSpeed={500}       
          fadeOut={true}
          autoStart={true}
          ref={confettiRef}
        />
      )}
    </View>
  );
}
