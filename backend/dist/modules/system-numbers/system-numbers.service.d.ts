export declare class SystemNumbersService {
    listActiveNumbers(): Promise<{
        id: string;
        instance_name: string;
        phone_number: string;
        formatted_phone: string;
        label: string;
        whatsapp_link: string;
        is_active: boolean;
    }[]>;
}
