declare module 'crc-full' {
  export class CRC {
    constructor(
      name: string,
      width: number,
      polynomial: number,
      initial: number,
      finalXor: number,
      inputReflected: boolean,
      resultReflected: boolean
    );

    compute(bytes: number[] | Buffer): number;
    computeBuffer(bytes: number[] | Buffer): Buffer;
  }
}
