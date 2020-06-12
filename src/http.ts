import request from 'request';

export default class HttpWrapper {
  hostName: string;
  scheme: string;
  port: number;

  constructor({ hostName, scheme, port }) {
    this.hostName = hostName;
    this.port = port;
    this.scheme = scheme;
  }

  private buildUrl(path: string) {
    let goodPath = path;

    if (path[0] === '/') {
      goodPath = path.substr(1);
    }

    const built = `${this.scheme}://${this.hostName}:${this.port}/${goodPath}`;

    return built;
  }

  async post(path: string, data: unknown) {
    return new Promise((resolve, reject) => {
      request.post(
        this.buildUrl(path),
        { json: data },
        (error, response, body) => {
          if (error) {
            reject(error);
          }

          resolve(JSON.parse(body));
        },
      );
    });
  }

  async get<TType>(path: string): Promise<TType> {
    return new Promise((resolve, reject) => {
      request.get(this.buildUrl(path), (error, response, body) => {
        if (error) {
          reject(error);
        }

        resolve(JSON.parse(body));
      });
    });
  }

  async patch(path: string, data: unknown) {
    return new Promise((resolve, reject) => {
      request.patch(
        this.buildUrl(path),
        { json: data },
        (error, response, body) => {
          if (error) {
            reject(error);
          }

          resolve(JSON.parse(body));
        },
      );
    });
  }
}
