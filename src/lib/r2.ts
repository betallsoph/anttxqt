import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const R2 = new S3Client({
    region: "auto",
    endpoint: `https://${import.meta.env.VITE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: import.meta.env.VITE_R2_ACCESS_KEY_ID,
        secretAccessKey: import.meta.env.VITE_R2_SECRET_ACCESS_KEY,
    },
});

const BUCKET = import.meta.env.VITE_R2_BUCKET_NAME;
const PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL;

export async function uploadToR2(file: File, path: string): Promise<string> {
    const key = `${path}/${Date.now()}-${file.name}`;

    await R2.send(
        new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: new Uint8Array(await file.arrayBuffer()),
            ContentType: file.type,
        })
    );

    return `${PUBLIC_URL}/${key}`;
}

export async function deleteFromR2(url: string): Promise<void> {
    const key = url.replace(`${PUBLIC_URL}/`, "");

    await R2.send(
        new DeleteObjectCommand({
            Bucket: BUCKET,
            Key: key,
        })
    );
}
