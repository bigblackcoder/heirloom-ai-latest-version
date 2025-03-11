import r2 from '../config/r2';

export class StorageService {
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.R2_BUCKET_NAME!;
  }

  async uploadFile(buffer: Buffer, key: string): Promise<string> {
    await r2
      .upload({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
      })
      .promise();
    
    return `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${this.bucketName}/${key}`;
  }
  
  async getFile(key: string): Promise<Buffer> {
    const response = await r2
      .getObject({
        Bucket: this.bucketName,
        Key: key
      })
      .promise();
    
    return response.Body as Buffer;
  }

  async deleteFile(key: string): Promise<void> {
    await r2
      .deleteObject({
        Bucket: this.bucketName,
        Key: key
      })
      .promise();
  }

  async listFiles(prefix?: string): Promise<string[]> {
    const response = await r2
      .listObjects({
        Bucket: this.bucketName,
        Prefix: prefix
      })
      .promise();
    
    return response.Contents?.map(item => item.Key!) || [];
  }
}
