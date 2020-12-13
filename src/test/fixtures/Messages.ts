import { MessageModel, UserGroupModel, UserModel } from 'model';

export const getSomeMessages = (from: UserModel, { to_user, to_group }: { to_user?: UserModel, to_group?: UserGroupModel }): MessageModel[] => {
    return [
        {
            "id": String(Math.floor(Math.random()*10_000)),
            "insertedAt": "2020-11-28T07:37:02",
            "updatedAt": "2020-11-28T07:37:02",
            "content": "Hallo",
            "senderUser": from,
            "recipientUser": to_user,
            "recipientGroup": to_group
        } as MessageModel,
        {
            "id": String(Math.floor(Math.random()*10_000)),
            "insertedAt": "2020-11-28T07:32:14",
            "updatedAt": "2020-11-28T07:32:14",
            "content": "Hallo",
            "senderUser": from,
            "recipientUser": to_user,
            "recipientGroup": to_group
        } as MessageModel,
        {
            "id": String(Math.floor(Math.random()*1000)),
            "insertedAt": "2020-11-28T07:29:31",
            "updatedAt": "2020-11-28T07:29:31",
            "content": "Hallo",
            "senderUser": from,
            "recipientUser": to_user,
            "recipientGroup": to_group
        } as MessageModel,
        {
            "id": String(Math.floor(Math.random()*10_000)),
            "insertedAt": "2020-11-28T07:19:17",
            "updatedAt": "2020-11-28T07:19:17",
            "content": "Hallo",
            "senderUser": from,
            "recipientUser": to_user,
            "recipientGroup": to_group
        } as MessageModel,
        {
            "id": String(Math.floor(Math.random()*10_000)),
            "insertedAt": "2020-11-28T07:00:09",
            "updatedAt": "2020-11-28T07:00:09",
            "content": "Hallo Welt!",
            "senderUser": from,
            "recipientUser": to_user,
            "recipientGroup": to_group
        } as MessageModel,
    ];
}
