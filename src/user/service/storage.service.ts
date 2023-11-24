import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlobServiceClient, BlockBlobClient } from '@azure/storage-blob'; // Add this import
import * as crypto from 'crypto';

@Injectable()
export class StorageService {
    AzureStorageConnection = '';
    AzureStorageContainer = '';
    constructor(
        private readonly configService: ConfigService,
    ) {
        this.AzureStorageConnection = this.configService.get<string>('AZURE_STORAGE_CONNECTION');
        this.AzureStorageContainer = this.configService.get<string>('AZURE_STORAGE_CONTAINER');
    }

    getBlockBlobClient(filename: string): BlockBlobClient {
        const blobServiceClient = BlobServiceClient.fromConnectionString(this.AzureStorageConnection);
        const blobContainer = blobServiceClient.getContainerClient(this.AzureStorageContainer);
        return blobContainer.getBlockBlobClient(filename);
    }

    private generateRandomFilename(originalname: string): string {
        const timestamp = new Date().getTime();
        const randomString = crypto.randomBytes(8).toString('hex');
        const uniqueFilename = `${timestamp}_${randomString}_${originalname}`;
        return uniqueFilename;
    }

    async uploadImage(filename: Express.Multer.File) {
        const uniqueFilename = this.generateRandomFilename(filename.originalname);
        const blobBlobClient = this.getBlockBlobClient(uniqueFilename);
        await blobBlobClient.uploadData(filename.buffer);
        return uniqueFilename;
    }

    async readStream(filename: string) {
        const blobBlobClient = this.getBlockBlobClient(filename);
        const downloadBlockBlobResponse = await blobBlobClient.download(0);
        return downloadBlockBlobResponse.readableStreamBody;
    }
}