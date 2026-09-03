import { CreateInstanceInput, UpdateInstanceInput, LogsQueryInput, UpdateSystemSettingsInput, UpdateWhatsAppConfigInput, TestMetaConnectionInput } from './admin.whatsapp.schemas.js';
export declare class AdminWhatsAppService {
    getSettings(): Promise<{
        reply_only_registered: boolean;
    }>;
    updateSettings(data: UpdateSystemSettingsInput): Promise<{
        reply_only_registered: boolean;
    }>;
    listInstances(): Promise<{
        connection_status: string;
        is_connected: boolean;
        id: string;
        phone_number: string;
        created_at: Date;
        instance_name: string;
        label: string;
        is_active: boolean;
    }[]>;
    createInstance(data: CreateInstanceInput): Promise<{
        id: string;
        phone_number: string;
        created_at: Date;
        instance_name: string;
        label: string;
        is_active: boolean;
    }>;
    getQrCode(id: string): Promise<{
        instance_name: string;
        base64: any;
        code: any;
        pairingCode: any;
        count: any;
    }>;
    getInstanceStatus(id: string): Promise<{
        id: string;
        instance_name: string;
        connection_status: string;
        is_connected: boolean;
    }>;
    restartInstance(id: string): Promise<{
        message: string;
    }>;
    logoutInstance(id: string): Promise<{
        message: string;
    }>;
    updateInstance(id: string, data: UpdateInstanceInput): Promise<{
        id: string;
        phone_number: string;
        created_at: Date;
        instance_name: string;
        label: string;
        is_active: boolean;
    }>;
    deleteInstance(id: string): Promise<{
        message: string;
    }>;
    getLogs(query: LogsQueryInput): Promise<{
        data: {
            status: import("@prisma/client").$Enums.WhatsAppLogStatus;
            id: string;
            created_at: Date;
            sender_number: string;
            target_instance: string;
            message_body: string;
            openai_response_payload: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getEvolutionStatus(): Promise<{
        is_online: boolean;
        base_url: string;
        api_key_configured: boolean;
        license: {
            status: string;
            instance_id?: string;
            register_url?: string | null;
        };
        instances_count: number;
        latency_ms: number;
        error?: string;
    }>;
    getEvolutionLicense(): Promise<{
        status: string;
        instance_id: string | undefined;
        register_url: string | null;
    }>;
    testEvolutionConnection(): Promise<{
        is_online: boolean;
        base_url: string;
        api_key_configured: boolean;
        license: {
            status: string;
            instance_id?: string;
            register_url?: string | null;
        };
        instances_count: number;
        latency_ms: number;
        error?: string;
    }>;
    activateEvolutionLicense(code: string): Promise<{
        message: string;
        status: {
            is_online: boolean;
            base_url: string;
            api_key_configured: boolean;
            license: {
                status: string;
                instance_id?: string;
                register_url?: string | null;
            };
            instances_count: number;
            latency_ms: number;
            error?: string;
        };
    }>;
    getProviderConfig(): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        active_provider: import("@prisma/client").$Enums.WhatsAppProviderType;
        meta_phone_number_id: string | null;
        meta_waba_id: string | null;
        meta_access_token: string | null;
        meta_verify_token: string | null;
        meta_app_secret: string | null;
    }>;
    updateProviderConfig(data: UpdateWhatsAppConfigInput): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        active_provider: import("@prisma/client").$Enums.WhatsAppProviderType;
        meta_phone_number_id: string | null;
        meta_waba_id: string | null;
        meta_access_token: string | null;
        meta_verify_token: string | null;
        meta_app_secret: string | null;
    }>;
    testMetaConnection(data?: TestMetaConnectionInput): Promise<import("../meta-whatsapp/meta.client.js").MetaConnectionStatus>;
}
export declare const adminWhatsAppService: AdminWhatsAppService;
