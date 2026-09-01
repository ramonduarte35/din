"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemNumbersService = void 0;
const prisma_js_1 = require("../../lib/prisma.js");
const phone_js_1 = require("../../utils/phone.js");
class SystemNumbersService {
    async listActiveNumbers() {
        const numbers = await prisma_js_1.prisma.systemWhatsAppNumber.findMany({
            where: { is_active: true },
            orderBy: { created_at: 'asc' },
        });
        return numbers.map((item) => ({
            id: item.id,
            instance_name: item.instance_name,
            phone_number: item.phone_number,
            formatted_phone: (0, phone_js_1.formatPhoneNumberDisplay)(item.phone_number),
            label: item.label,
            whatsapp_link: `https://wa.me/${item.phone_number}`,
            is_active: item.is_active,
        }));
    }
}
exports.SystemNumbersService = SystemNumbersService;
