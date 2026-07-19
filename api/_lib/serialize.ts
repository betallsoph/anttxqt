import { ObjectId, type Document } from "mongodb";

export function serializeDoc<T extends Document>(doc: T) {
    const { _id, ...rest } = doc;
    return {
        id: _id instanceof ObjectId ? _id.toString() : String(_id),
        ...rest,
    };
}

export function toObjectId(id: string | undefined) {
    if (!id || !ObjectId.isValid(id)) return null;
    return new ObjectId(id);
}
