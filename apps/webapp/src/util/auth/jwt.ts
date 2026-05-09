export interface JWTBody {
  audience: string;
  issuer: string;
  jwtId: string;
  subject: string;
  expires: Date;
  issuedAt: Date;
  notBefore: Date;
  tenantId: number;
  groupIds: number[];
  type: 'access' | 'refresh' | 'high_security';
}

export interface JWTHeader {
  algorithm: string;
  type: 'JWT';
}

export class JWT {
  static parse(token: string): JWT {
    const [header, body] = token
      .split('.')
      .slice(0, 2)
      .map((s) => JSON.parse(atob(s)));
    const notBefore = new Date(body.nbf * 1000);
    const expires = new Date(body.exp * 1000);

    if (header.typ !== 'JWT') {
      throw new Error('Token is not a valid JSON Web Token');
    }

    return new JWT(
      {
        audience: body.aud,
        issuer: body.iss,
        jwtId: body.jid,
        subject: body.sub,
        tenantId: body.tid,
        groupIds: body.gps,
        expires,
        notBefore,
        issuedAt: new Date(body.iat * 1000),
        type: body.typ,
      },
      { algorithm: header.alg, type: header.typ }
    );
  }

  constructor(
    public body: JWTBody,
    public header: JWTHeader = { algorithm: 'HS512', type: 'JWT' }
  ) {}

  /**
   * Checks if the token is expired, considering an optional buffer time.
   *
   * @param buffer - Time in milliseconds to subtract from the current time when checking expiration.
   * This buffer allows you to consider a token as expired slightly before its actual expiration time, which can help prevent edge cases where a token expires during processing.
   * Defaults to 30 seconds (30,000 ms).
   *
   * @return true if the token is expired (considering the buffer), false otherwise.
   */
  isExpired(buffer = 30_000): boolean {
    const now = new Date().getTime() - buffer;

    return now >= this.body.expires.getTime();
  }

  /**
   * Checks if the token is already valid, as defined by the "not before" (nbf) claim,
   * as well as not being expired considering an optional buffer time (see isExpired.)
   *
   * @param buffer - Time in milliseconds to subtract from the current time when checking expiration.
   * Defaults to 30 seconds (30,000 ms).
   *
   * @return true if the token is valid, false otherwise.
   */
  isValid(buffer = 30_000): boolean {
    return new Date() >= this.body.notBefore && !this.isExpired(buffer);
  }
}
