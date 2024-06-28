export class BlobPolyfill extends Blob implements Blob {
  public get inputData(): BlobPart[] {
    return this.content;
  }
  constructor(
    protected content: BlobPart[],
    protected options: BlobPropertyBag = {}
  ) {
    super(content, options);
  }
}
