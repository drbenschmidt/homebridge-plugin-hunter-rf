import time
import sys
import RPi.GPIO as GPIO
from messaging2 import FAN_OFF, send_message, build_message

TRANSMIT_PIN = 12

if __name__ == '__main__':
    send_message(FAN_OFF, GPIO, TRANSMIT_PIN, 3)
