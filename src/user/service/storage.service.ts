import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlobServiceClient, BlockBlobClient } from '@azure/storage-blob'; // Add this import
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as fastCsv from 'fast-csv';
import { createReadStream, createWriteStream } from 'fs';

@Injectable()
export class StorageService {
    constructor(
        private readonly configService: ConfigService,
    ) { }

    getBlockBlobClient(filename: string): BlockBlobClient {
        const blobServiceClient = BlobServiceClient.fromConnectionString(this.configService.get<string>('AZURE_STORAGE_CONNECTION'));
        const blobContainer = blobServiceClient.getContainerClient(this.configService.get<string>('AZURE_STORAGE_CONTAINER'));
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

    async exportToCsvAndUpload(data: any[], filename: string): Promise<string> {
        const csvData = data.map((item) => ({ StudentID: item.StudentID, Fullname: item.Fullname }));
        const csvFilePath = `./${filename}.csv`;

        await new Promise((resolve, reject) => {
            const csvStream = fastCsv.writeToPath(csvFilePath, csvData, { headers: true });
            csvStream.on('finish', () => resolve(csvStream));
            csvStream.on('error', (error) => reject(error));
        });

        const uniqueFilename = this.generateRandomFilename(`${filename}.csv`);
        const blobBlobClient = this.getBlockBlobClient(uniqueFilename);

        await blobBlobClient.uploadFile(csvFilePath);

        createReadStream(csvFilePath).pipe(createWriteStream('/dev/null'));

        return uniqueFilename;
    }

    async readStream(filename: string) {
        const blobBlobClient = this.getBlockBlobClient(filename);
        const downloadBlockBlobResponse = await blobBlobClient.download(0);
        return downloadBlockBlobResponse.readableStreamBody;
    }


}