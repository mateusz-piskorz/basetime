'use client';
import dayjs from 'dayjs';

export const Footer = () => {
    return <footer className="bg-sidebar py-14 text-center">© BaseTime {dayjs().format('YYYY')}, All Rights Reserved</footer>;
};
