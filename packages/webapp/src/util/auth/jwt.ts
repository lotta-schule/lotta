export interface JWTBody {
  audience: string;
  issuer: string;
  jwtId: string;
  subject: string;
  expires: Date;
  issuedAt: Date;
  notBefore: Date;
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

  isExpired(buffer = 30_000): boolean {
    const now = new Date().getTime() - buffer;

    return now <= this.body.expires.getTime();
  }

  isValid(): boolean {
    const now = new Date();
    return now <= this.body.expires && now >= this.body.notBefore;
  }
}
