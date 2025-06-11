import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet, } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { Audio } from 'expo-av';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useRoute } from '@react-navigation/native';
import { Dimensions } from 'react-native';
import { Animated, Easing } from 'react-native';


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
    <View style={styles.container}>
      <Text style={{ fontSize: 30, fontWeight:'bold', color:'#FFFFFF', marginBottom: 50 }}>{taskName}</Text>
           
      {!started ? (
        <>
          <Text style={{ margin: 30, fontSize: 25, fontWeight:'normal', color:'#535353' }}>Optional: Set a Timer</Text>
          
          <View style={styles.timerButtons} >
          <TouchableOpacity style={styles.timerBtn} onPress={() => setDuration(300)}>
            <Text style={styles.timerBtnText}>5 min</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.timerBtn} onPress={() => setDuration(600)}>
            <Text style={styles.timerBtnText}>10 min</Text>
          </TouchableOpacity>

          </View>

          <Text style={{ margin: 30, fontSize: 25, fontWeight:'normal', color:'#535353' }}>or</Text>

          <TouchableOpacity style={styles.noTimerBtn} onPress={() => setDuration(0)}>
            <Text style={styles.noTimerBtnText}>No Timer</Text>
          </TouchableOpacity>

          {duration !== null && (
            <TouchableOpacity onPress={startTask} style={styles.startBtn}>
              <Text style={styles.startBtnText}>Start Task</Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <>
          <Text style={styles.label}>
            {duration !== 0 && (<Text style={styles.label}>Time Remaining:</Text>
)}
          </Text>

          {duration === 0 ? (
            <View style={styles.pulseContainer}>
              <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]} />
              <Text style={styles.focusText}>Focus Mode</Text>
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
                <Text style={styles.time}>
                  {formatTime(remaining)}
                </Text>
              )}
            </AnimatedCircularProgress>
          )}



          <TouchableOpacity onPress={handleComplete} style={styles.completeBtn}>
            <Text style={styles.completeBtnText}>Complete</Text>
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

const styles = StyleSheet.create({

  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20, 
    backgroundColor: '#5eb1cc'
  },

  label: { 
    fontSize: 22, 
    marginBottom: 20 
  },
  
  timerButtons: { 
    flexDirection: 'row', 
    gap: 10, 
    marginBottom: 20, 
  },

  time: { 
    fontSize: 36, 
    fontWeight: 'bold', 
    marginTop: 15 
  },

  pulseContainer: {
    position: 'relative',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },

  focusText: {
    position: 'absolute',
    color: '#3f3f3f',
    top: '50%',
    fontSize: 24,
    fontWeight: 'normal',
    textAlign: 'center',
  },

  pulseCircle: {
    width: 150,
    height: 150,
    borderRadius: 100,
    backgroundColor: '#104e5440', 
    shadowColor: '#104e54',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 20, 
    marginTop: 30,
  },


  completeBtn: {
    backgroundColor: '#FFD700',
    padding: 12,
    borderRadius: 8,
    marginTop: 30,
  },

  completeBtnText: { 
    fontSize: 30, 
    color: '#FFFFFF',
    fontWeight: '500',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignItems: 'center',
   },

  startBtn: {
    backgroundColor: '#f7bd50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 30,
  },

  startBtnText: { 
    fontSize: 30, 
    color: '#535353',
    fontWeight: '500',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignItems: 'center',
   },

  timerButtons: {
    marginVertical: 0,
    flexDirection: 'row',    
  },

  timerBtn: {
    backgroundColor: '#178591',  
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 6,
    marginVertical: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignItems: 'center',
  },

  timerBtnText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '500',
  },

  completeBtn: {
    backgroundColor: '#178591',  
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 50,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignItems: 'center',
  },

  completeText: {
    color: '#FFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  noTimerBtn: {
    backgroundColor: '#178591',  
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignItems: 'center',
  },

  noTimerBtnText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '500',
  },
});
