import {
  Service,
  PlatformAccessory,
  CharacteristicValue,
  CharacteristicSetCallback,
  CharacteristicGetCallback,
  Logger,
} from 'homebridge';

import { HunterFanRfPlatform } from './platform';

enum FanState {
  Off = 'Off',
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

enum LightState {
  Off = 'Off',
  On = 'On',
}

interface Props {
  displayName: string;
}

class NamedLogger {
  name: string;
  private log: Logger;

  constructor(name: string, log: Logger) {
    this.name = name;
    this.log = log;
  }

  debug = (message: string, ...parameters: unknown[]): void =>
    this.log.debug(`[${this.name}] ${message}`, ...parameters);

  info = (message: string, ...parameters: unknown[]): void =>
    this.log.info(`[${this.name}] ${message}`, ...parameters);
}

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class HunterRfFanAccessory {
  private lightService: Service;
  private fanService: Service;

  private state = {
    light: LightState.Off,
    fan: FanState.Off,
    fanActive: false,
    fanValue: 0,
  };

  private props: Props;

  private log: NamedLogger;

  constructor(
    private readonly platform: HunterFanRfPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    this.props = accessory.context.device as Props;
    this.log = new NamedLogger(this.props.displayName, this.platform.log);

    // set accessory information
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Hunter')
      .setCharacteristic(this.platform.Characteristic.Model, '434Mhz RF')
      .setCharacteristic(
        this.platform.Characteristic.SerialNumber,
        'Default-Serial',
      );

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory
    this.lightService =
      this.accessory.getService(this.platform.Service.Lightbulb) ||
      this.accessory.addService(this.platform.Service.Lightbulb);

    this.fanService =
      this.accessory.getService(this.platform.Service.Fan) ||
      this.accessory.addService(this.platform.Service.Fanv2);

    // To avoid "Cannot add a Service with the same UUID another Service without also defining a unique 'subtype' property." error,
    // when creating multiple services of the same type, you need to use the following syntax to specify a name and subtype id:
    // this.accessory.getService('NAME') ?? this.accessory.addService(this.platform.Service.Lightbulb, 'NAME', 'USER_DEFINED_SUBTYPE');

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.lightService.setCharacteristic(
      this.platform.Characteristic.Name,
      this.props.displayName,
    );

    this.fanService.setCharacteristic(
      this.platform.Characteristic.Name,
      this.props.displayName,
    );

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Lightbulb

    this.lightService
      .getCharacteristic(this.platform.Characteristic.On)
      .on('get', this.onLightGetOn)
      .on('set', this.onLightSetOn);

    this.fanService
      .getCharacteristic(this.platform.Characteristic.Active)
      .on('get', this.onFanGetActive)
      .on('set', this.onFanSetActive);

    this.fanService
      .getCharacteristic(this.platform.Characteristic.RotationSpeed)
      .on('get', this.onFanGetRotationSpeed)
      .on('set', this.onFanSetRotationSpeed);
  }

  onLightSetOn = (
    value: CharacteristicValue,
    callback: CharacteristicSetCallback,
  ) => {
    // implement your own code to turn your device on/off
    this.state.light = (value as boolean) ? LightState.On : LightState.Off;

    this.log.debug('Set Light On ->', value);

    // you must call the callback function
    callback(null);
  };

  onLightGetOn = (callback: CharacteristicGetCallback) => {
    // implement your own code to check if the device is on
    const isOn = this.state.light === LightState.On;

    this.log.debug('Get Light On ->', isOn);

    // you must call the callback function
    // the first argument should be null if there were no errors
    // the second argument should be the value to return
    callback(null, isOn);
  };

  onFanSetActive = (
    value: CharacteristicValue,
    callback: CharacteristicSetCallback,
  ) => {
    const { Active } = this.platform.Characteristic;

    // implement your own code to turn your device on/off
    this.state.fanActive = Boolean((value as number) === Active.ACTIVE);

    this.log.debug('Set Fan Active ->', value);

    // you must call the callback function
    callback(null);
  };

  onFanGetActive = (callback: CharacteristicGetCallback) => {
    // implement your own code to check if the device is on
    const isActive = this.state.fanActive;

    this.log.debug('Get Fan Active ->', isActive);

    // you must call the callback function
    // the first argument should be null if there were no errors
    // the second argument should be the value to return
    callback(null, isActive);
  };

  onFanSetRotationSpeed = (
    value: CharacteristicValue,
    callback: CharacteristicSetCallback,
  ) => {
    const targetValue = value as number;
    this.state.fanValue = value as number;

    if (targetValue > 1 && targetValue < 33) {
      this.state.fan = FanState.Low;
    }

    if (targetValue > 33 && targetValue < 66) {
      this.state.fan = FanState.Medium;
    }

    if (targetValue > 66 && targetValue <= 100) {
      this.state.fan = FanState.High;
    }

    this.log.debug(`Set Fan Speed -> ${value} [${this.state.fan.toString()}]`);

    callback(null);
  };

  onFanGetRotationSpeed = (callback: CharacteristicGetCallback) => {
    const { fanValue, fan } = this.state;

    this.log.debug(`Get Fan Speed -> ${fanValue} [${fan.toString()}]`);

    callback(null, this.state.fanValue);
  };
}
