import time

SHORT_ON = (1.25864 - 1.25810)
SHORT_OFF = (1.26288 - 1.26262)
LONG_ON = (1.27339 - 1.27252)
LONG_OFF = (0.860532 - 0.85986)
HEADER_WAIT = (1.27250 - 1.26741)
SYNC_PULSES = 12
SEND_WAIT = (0.949021 - 0.923355)

# NOTE: FAN_OFF does not work on first floor fan (yet).

# Messages are composed of a number that represents how many LONG_ON pulses should be sent.
LIGHT_TOGGLE = 	[1, 3, 3, 2, 0, 1, 4, 0, 4, 0, 3, 0, 0, 0, 0, 1, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0,  8]
FAN_TOGGLE = 		[1, 3, 3, 2, 0, 1, 4, 0, 4, 0, 3, 0, 0, 0, 0, 1, 2, 0, 0, 0, 0, 0, 0, 1, 0, 0, 8, 3, 0,  0]
FAN_UP = 				[1, 3, 3, 2, 0, 1, 4, 0, 4, 0, 3, 0, 0, 0, 0, 1, 2, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 3, 8,  0]
FAN_DOWN = 			[1, 3, 3, 2, 0, 1, 4, 0, 4, 0, 3, 0, 0, 0, 0, 1, 2, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 2, 7,  1]
FAN_OFF = 			[1, 3, 3, 2, 0, 1, 4, 0, 4, 0, 3, 0, 0, 0,    1, 2, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 6, 3,  1]
FAN_LOW = 			[1, 3, 3, 2, 0, 1, 4, 0, 4, 0, 3, 0, 0, 0, 0, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 10, 1]
FAN_MED = 			[1, 3, 3, 2, 0, 1, 4, 0, 4, 0, 3, 0, 0, 0, 0, 1, 2, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 6,  5]
FAN_HIGH = 			[1, 3, 3, 2, 0, 1, 4, 0, 4, 0, 3, 0, 0, 0, 0, 1, 2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 5,  6]
UP_FAN_OFF = 		[3, 0, 8, 0, 1, 1, 2, 0, 1, 0, 2, 1, 2, 0,    1, 3, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 6, 3,  1]
UP_FAN_LOW = 		[3, 0, 8, 0, 1, 1, 2, 0, 1, 0, 2, 1, 2, 0,    1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 10, 1]
UP_FAN_MEDIUM = [3, 0, 8, 0, 1, 1, 2, 0, 1, 0, 2, 1, 2, 0,    1, 3, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 6,  5]
UP_FAN_HIGH = 	[3, 0, 8, 0, 1, 1, 2, 0, 1, 0, 2, 1, 2, 0,    1, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 5,  6]
UP_LIGHT_TOGG = [3, 0, 8, 0, 1, 1, 2, 0, 1, 0, 2, 1, 2, 0,    1, 3, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 3,  8]

# Up and Down arrows held for 5 seconds
LIGHT_RESET = []

# Press and hold light button
LIGHT_DIM = []

def build_message(message):
	result = []

	# for each int for how many long pulses we need
	for num_pulses in message:
		data_group = []

		# Add them to the group.
		for pulse in range(num_pulses):
			data_group.append(LONG_ON)

		# Then tack on a short at the end
		data_group.append(SHORT_ON)
		result.append(data_group)

	return result

def send_pulse(length, GPIO, PIN):
	GPIO.output(PIN, 1)
	time.sleep(length)
	GPIO.output(PIN, 0)

def send_header(GPIO, PIN):
	for i in range(SYNC_PULSES):
		send_pulse(SHORT_ON, GPIO, PIN)
		time.sleep(SHORT_OFF)

	time.sleep(HEADER_WAIT - SHORT_OFF)

def send_message(message, GPIO, PIN, repeat = 3):
	''' Send a message to the fan, hopefully '''

	GPIO.setmode(GPIO.BCM)
	GPIO.setup(PIN, GPIO.OUT)

	# Convert messages into data_groups
	data_groups = build_message(message)

	for i in range(repeat):
		# Send the header to the fan and wait
		send_header(GPIO, PIN)

		# Send each pulse to fan
		for data_group in data_groups:
			for pulse in data_group:
				send_pulse(pulse, GPIO, PIN)
				time.sleep(SHORT_OFF)
			time.sleep(LONG_OFF)

		# Wait for a small bit before sending next attempt
		time.sleep(SEND_WAIT - SHORT_OFF)

	GPIO.cleanup()
