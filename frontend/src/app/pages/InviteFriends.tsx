import { IconArrowLeft, IconCopy, IconShare, IconBrandTelegram, IconBrandWhatsapp, IconGift, IconUsers, IconStar } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { useTranslation } from "../i18n/useTranslation";
import { useState } from "react";

export function InviteFriends() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const referralCode = "ISHTOP2026";
  const referralLink = `https://ishtop.uz/ref/${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    const text = "Присоединяйся к IshTop - найди работу своей мечты! 🚀";
    const encodedText = encodeURIComponent(text);
    const encodedLink = encodeURIComponent(referralLink);

    let shareUrl = "";
    if (platform === "telegram") {
      shareUrl = `https://t.me/share/url?url=${encodedLink}&text=${encodedText}`;
    } else if (platform === "whatsapp") {
      shareUrl = `https://wa.me/?text=${encodedText}%20${encodedLink}`;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank");
    }
  };

  const stats = [
    { icon: IconUsers, label: "Приглашено друзей", value: "0" },
    { icon: IconGift, label: "Бонусов получено", value: "0" },
    { icon: IconStar, label: "Уровень", value: "Новичок" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 h-16 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors lg:hidden"
          >
            <IconArrowLeft className="w-6 h-6 text-gray-900" stroke={2} />
          </button>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{t("inviteFriends")}</h1>
            <p className="text-sm text-gray-600 hidden lg:block">Пригласите друзей и получайте бонусы</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 lg:px-8 pt-6 space-y-6">
        {/* Hero Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 lg:p-8 text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold mb-2">Приглашай друзей!</h2>
              <p className="text-blue-100 text-sm lg:text-base">Получайте бонусы за каждого друга</p>
            </div>
            <IconGift className="w-12 h-12 lg:w-16 lg:h-16 text-blue-200" stroke={1.5} />
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mt-6">
            <p className="text-sm text-blue-100 mb-2">Ваш реферальный код</p>
            <p className="text-2xl font-bold tracking-wider">{referralCode}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 lg:gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-100 p-4 lg:p-6 text-center">
              <stat.icon className="w-8 h-8 lg:w-10 lg:h-10 text-blue-600 mx-auto mb-2" stroke={1.5} />
              <p className="text-xs lg:text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-lg lg:text-xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Referral Link */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Ваша реферальная ссылка</h3>
          <div className="flex gap-2">
            <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
              <p className="text-sm text-gray-900 truncate">{referralLink}</p>
            </div>
            <button
              onClick={handleCopy}
              className="bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <IconCopy className="w-5 h-5" stroke={2} />
              <span className="hidden lg:inline text-sm font-medium">
                {copied ? "Скопировано!" : "Копировать"}
              </span>
            </button>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Поделиться</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleShare("telegram")}
              className="flex items-center justify-center gap-3 bg-blue-50 text-blue-600 py-3.5 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <IconBrandTelegram className="w-6 h-6" stroke={1.5} />
              <span className="font-medium">Telegram</span>
            </button>
            <button
              onClick={() => handleShare("whatsapp")}
              className="flex items-center justify-center gap-3 bg-green-50 text-green-600 py-3.5 rounded-xl hover:bg-green-100 transition-colors"
            >
              <IconBrandWhatsapp className="w-6 h-6" stroke={1.5} />
              <span className="font-medium">WhatsApp</span>
            </button>
            <button
              onClick={handleCopy}
              className="col-span-2 flex items-center justify-center gap-3 bg-gray-50 text-gray-700 py-3.5 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <IconShare className="w-6 h-6" stroke={1.5} />
              <span className="font-medium">Другие способы</span>
            </button>
          </div>
        </div>

        {/* How it Works */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Как это работает?</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Пригласите друга</h4>
                <p className="text-sm text-gray-600">Отправьте свою реферальную ссылку другу</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Друг регистрируется</h4>
                <p className="text-sm text-gray-600">Ваш друг создает аккаунт по вашей ссылке</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Получите бонусы</h4>
                <p className="text-sm text-gray-600">Получайте бонусы когда друг найдет работу</p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 p-5 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Преимущества программы</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <IconStar className="w-4 h-4 text-white" stroke={2} />
              </div>
              <p className="text-sm text-gray-700">Бонусы за каждого приглашенного друга</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <IconStar className="w-4 h-4 text-white" stroke={2} />
              </div>
              <p className="text-sm text-gray-700">Дополнительные возможности для премиум пользователей</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <IconStar className="w-4 h-4 text-white" stroke={2} />
              </div>
              <p className="text-sm text-gray-700">Приоритет в поиске работы</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
