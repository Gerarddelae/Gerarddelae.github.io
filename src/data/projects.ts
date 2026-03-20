export interface Project {
	name: string;
	demoLink: string;
	tags?: string[];
	description?: string;
	postLink?: string;
	demoLinkRel?: string;
	stargazers_count?: number;
	html_url?: string;
	coverImage?: string;
	[key: string]: any;
}

export const projects: Project[] = [
	{
		name: 'MAGUESTIC',
		description:
			'Maguestic es una aplicación de gestión hotelera full-stack construida con Angular y Spring Boot. Ofrece una solución integral para gestionar operaciones hoteleras, incluyendo reservas, huéspedes, habitaciones y servicios, con una interfaz moderna y responsiva.',
		demoLink: 'https://github.com/Gerarddelae/hotel-spring-angular',
		tags: ['Angular', 'Spring Boot', 'Full-stack'],
		coverImage: '/blog-placeholder-3.jpg'
	},
	{
		name: 'HOTEL SPA',
		description:
			'Hotel SPA es una aplicación de una sola página (SPA) diseñada para que pequeños hoteles gestionen de manera eficiente huéspedes, reservas, habitaciones y otras operaciones esenciales. La plataforma ofrece una interfaz intuitiva para el personal del hotel mientras mantiene una base de datos centralizada.',
		demoLink: 'https://github.com/Gerarddelae/hotel-spa',
		tags: ['SaaS', 'JS'],
		coverImage: '/blog-placeholder-2.jpg'
	},
	{
		name: 'SQL AGENT',
		description:
			"El Agente de Consultas SQL es una potente herramienta asistida por IA diseñada para optimizar las interacciones con bases de datos. Permite a los usuarios generar, analizar y refinar consultas SQL sin esfuerzo utilizando procesamiento de lenguaje natural (NLP), simplificando operaciones complejas de base de datos.",
		demoLink: 'https://github.com/Gerarddelae/Hotel-SQL-Agent',
		demoLinkRel: 'nofollow noopener noreferrer',
		tags: ['AI', 'Saas', 'Agent', 'Python'],
		coverImage: '/blog-placeholder-4.jpg'
	},
	{
		name: 'VOXPOPULY',
		description:
			'Voxpopuly es un proyecto de código abierto para recopilar, agregar y visualizar opiniones públicas. Proporciona herramientas ligeras de encuestas y análisis para ayudar a los equipos a obtener comentarios rápidos y derivar insights de las respuestas de la comunidad.',
		demoLink: 'https://github.com/Gerarddelae/voxpopuly',
		demoLinkRel: 'nofollow noopener noreferrer',
		tags: ['Open Source', 'Polling', 'Analytics'],
		coverImage: '/blog-placeholder-1.jpg'
	}
];
