import HttpWrapper from './http';

export interface IFanProps {
  id: number;
  name?: string;
  remoteCode: string;
}

export class Fan implements IFanProps {
  id: number;
  name?: string;
  remoteCode: string;
  piLink: PiLink;

  static DEFAULTS = {
    id: -1,
    remoteCode: '',
    name: undefined,
  };

  constructor(props: IFanProps = Fan.DEFAULTS, piLink: PiLink) {
    const { id, name, remoteCode } = props;

    this.id = id;
    this.name = name;
    this.remoteCode = remoteCode;
    this.piLink = piLink;
  }

  toJson() {
    return {
      id: this.id,
      name: this.name,
      remoteCode: this.remoteCode,
    };
  }

  async setFanSpeed(speed: number) {
    return this.piLink.httpWrapper.patch(`/fans/${this.id}`, { speed });
  }

  async setFanLight(isOn: boolean) {
    return this.piLink.httpWrapper.patch(`/fans/${this.id}`, { lightOn: isOn });
  }
}

export default class PiLink {
  httpWrapper: HttpWrapper;
  private _fans?: Array<Fan> = undefined;

  constructor({ hostName, scheme = 'http', port = 8083 }) {
    this.httpWrapper = new HttpWrapper({ hostName, scheme, port });
  }

  private async getFansFromServer(): Promise<Array<Fan>> {
    const fansRaw = await this.httpWrapper.get<Array<IFanProps>>('/fans');

    return fansRaw.map((fanProps) => new Fan(fanProps, this));
  }

  async getFans(): Promise<Array<Fan>> {
    if (this._fans === undefined) {
      this._fans = await this.getFansFromServer();
    }

    return this._fans as Array<Fan>;
  }

  async getFan(id: number): Promise<Fan | undefined> {
    return (await this.getFans()).find((f) => f.id === id);
  }
}
