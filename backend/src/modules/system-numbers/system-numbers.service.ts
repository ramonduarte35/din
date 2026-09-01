import { prisma } from '../../lib/prisma.js';
import { formatPhoneNumberDisplay } from '../../utils/phone.js';

export class SystemNumbersService {
  async listActiveNumbers() {
    const numbers = await prisma.systemWhatsAppNumber.findMany({
      where: { is_active: true },
      orderBy: { created_at: 'asc' },
    });

    return numbers.map((item) => ({
      id: item.id,
      instance_name: item.instance_name,
      phone_number: item.phone_number,
      formatted_phone: formatPhoneNumberDisplay(item.phone_number),
      label: item.label,
      whatsapp_link: `https://wa.me/${item.phone_number}`,
      is_active: item.is_active,
    }));
  }
}
