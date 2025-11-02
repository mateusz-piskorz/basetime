'use client';

import { AppLogo } from '@/components/common/app-logo';
import dayjs from 'dayjs';
import {
    //   Dribbble,
    //   Facebook,
    //   Github,
    //   Instagram,
    //   Twitter,
    Mail,
    MapPin,
    Phone,
} from 'lucide-react';

const data = {
    facebookLink: 'https://facebook.com/mvpblocks',
    instaLink: 'https://instagram.com/mvpblocks',
    twitterLink: 'https://twitter.com/mvpblocks',
    githubLink: 'https://github.com/mvpblocks',
    dribbbleLink: 'https://dribbble.com/mvpblocks',
    services: {
        webdev: '/web-development',
        webdesign: '/web-design',
        marketing: '/marketing',
        googleads: '/google-ads',
    },
    about: {
        history: '/company-history',
        team: '/meet-the-team',
        handbook: '/employee-handbook',
        careers: '/careers',
    },
    help: {
        faqs: '/faqs',
        support: '/support',
        livechat: '/live-chat',
    },
    contact: {
        email: 'hello@mvpblocks.com',
        phone: '+91 8637373116',
        address: 'Kolkata, West Bengal, India',
    },
    company: {
        name: 'BaseTime',
        description:
            'Building beautiful and functional web experiences with modern technologies. We help startups and businesses create their digital presence.',
        logo: '/logo.svg',
    },
};

// const socialLinks = [
//   { icon: Facebook, label: 'Facebook', href: data.facebookLink },
//   { icon: Instagram, label: 'Instagram', href: data.instaLink },
//   { icon: Twitter, label: 'Twitter', href: data.twitterLink },
//   { icon: Github, label: 'GitHub', href: data.githubLink },
//   { icon: Dribbble, label: 'Dribbble', href: data.dribbbleLink },
// ];

const aboutLinks = [
    { text: 'Company History', href: data.about.history },
    { text: 'Meet the Team', href: data.about.team },
    { text: 'Employee Handbook', href: data.about.handbook },
    { text: 'Careers', href: data.about.careers },
];

const serviceLinks = [
    { text: 'Web Development', href: data.services.webdev },
    { text: 'Web Design', href: data.services.webdesign },
    { text: 'Marketing', href: data.services.marketing },
    { text: 'Google Ads', href: data.services.googleads },
];

const helpfulLinks = [
    { text: 'FAQs', href: data.help.faqs },
    { text: 'Support', href: data.help.support },
    { text: 'Live Chat', href: data.help.livechat, hasIndicator: true },
];

const contactInfo = [
    { icon: Mail, text: data.contact.email },
    { icon: Phone, text: data.contact.phone },
    { icon: MapPin, text: data.contact.address, isAddress: true },
];

export const Footer = () => {
    return (
        <footer className="bg-sidebar mx-auto max-w-[1920px]" id="footer-section">
            <div className="mx-auto max-w-[1920px] px-5 pt-24 pb-5 sm:px-6 sm:pb-6 md:px-8 md:pb-8 lg:px-10 lg:pt-28 2xl:px-20 2xl:pt-40">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="flex flex-col items-center sm:items-start">
                        <div className="flex items-center gap-2">
                            <AppLogo />
                        </div>

                        <p className="text-foreground/50 mt-6 max-w-md text-center leading-relaxed sm:max-w-xs sm:text-left">
                            {data.company.description}
                        </p>

                        {/* <ul className="mt-8 flex justify-center gap-6 sm:justify-start md:gap-8">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <li key={label}>
                  <Link
                    prefetch={false}
                    href={href}
                    className="text-primary hover:text-primary/80 transition"
                  >
                    <span className="sr-only">{label}</span>
                    <Icon className="size-6" />
                  </Link>
                </li>
              ))}
            </ul> */}
                    </div>

                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:col-span-2">
                        <div className="text-center sm:text-left">
                            <p className="text-lg font-medium">About Us</p>
                            <ul className="mt-8 space-y-4 text-sm">
                                {aboutLinks.map(({ text, href }) => (
                                    <li key={text}>
                                        <a className="text-secondary-foreground/70 transition" href={href}>
                                            {text}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="text-center sm:text-left">
                            <p className="text-lg font-medium">Our Services</p>
                            <ul className="mt-8 space-y-4 text-sm">
                                {serviceLinks.map(({ text, href }) => (
                                    <li key={text}>
                                        <a className="text-secondary-foreground/70 transition" href={href}>
                                            {text}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="text-center sm:text-left">
                            <p className="text-lg font-medium">Contact Us</p>
                            <ul className="mt-8 space-y-4 text-sm">
                                {contactInfo.map(({ icon: Icon, text, isAddress }) => (
                                    <li key={text}>
                                        <a className="flex items-center justify-center gap-1.5 sm:justify-start" href="#">
                                            <Icon className="text-primary size-5 shrink-0" />
                                            {isAddress ? (
                                                <address className="text-secondary-foreground/70 -mt-0.5 flex-1 not-italic transition">
                                                    {text}
                                                </address>
                                            ) : (
                                                <span className="text-secondary-foreground/70 flex-1 transition">{text}</span>
                                            )}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="mt-12 border-t pt-6">
                    <div className="text-center sm:flex sm:justify-between sm:text-left">
                        <p className="text-sm">
                            <span className="block sm:inline">All rights reserved.</span>
                        </p>

                        <p className="text-secondary-foreground/70 mt-4 text-sm transition sm:order-first sm:mt-0">
                            &copy; {dayjs().format('YYYY')} {data.company.name}
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};
