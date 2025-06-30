'use client';

import React from 'react';
import Link from 'next/link';

const services = [
	{
		title: '🎤 Artist Features',
		description:
			'Buy verses, hooks, or full tracks — or list your own features to get booked.',
		href: '/explore?role=artist',
	},
	{
		title: '🎛️ Mixing & Mastering',
		description:
			'Hire engineers — or offer your own tuning, mastering, and vocal services.',
		href: '/explore?role=engineer',
	},
	{
		title: '🎥 Music Videos & Visuals',
		description:
			'Book videographers — or sell your own shooting and editing packages.',
		href: '/explore?role=videographer',
	},
	{
		title: '🏢 Studio Time',
		description:
			'Book real studios — or rent out your space with availability and pricing.',
		href: '/explore?role=studio',
	},
	{
		title: '🎼 Beats Marketplace',
		description:
			'Buy exclusive/non-exclusive beats — or list your own in the marketplace.',
		href: '/beats',
	},
	{
		title: '🌍 Open Network',
		description:
			'Join AuditoryX to get discovered, booked, and paid by clients worldwide.',
		href: '/apply',
	},
];

export default function ServicesPage() {
	return (
		<div className="min-h-screen bg-black text-white">
			<div className="max-w-6xl mx-auto px-6 py-20 space-y-12">
				<div className="text-center">
					<h1 className="text-4xl font-bold mb-3">
						What You Can Do on AuditoryX
					</h1>
					<p className="text-gray-400 text-lg max-w-2xl mx-auto">
						Whether you&apos;re looking to book talent or sell your services —
						AuditoryX is built to help you do both.
					</p>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{services.map((service) => (
						<Link
							key={service.title}
							href={service.href}
							className="border border-neutral-700 p-6 rounded-xl hover:border-white/80 transition"
						>
							<h2 className="text-xl font-semibold mb-2">{service.title}</h2>
							<p className="text-sm text-gray-400">
								{service.description}
							</p>
						</Link>
					))}
				</div>

				<div className="pt-12 text-center">
					<h3 className="text-xl font-semibold">
						Ready to offer your own services?
					</h3>
					<p className="text-sm text-gray-400 mb-4">
						Apply now to join the network and start getting booked globally.
					</p>
					<Link
						href="/apply"
						className="border px-6 py-2 rounded hover:bg-white hover:text-black transition"
					>
						Apply as a Creator
					</Link>
				</div>
			</div>
		</div>
	);
}
