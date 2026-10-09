export type ServiceMediaSource = { image: string; alt: string };
export type ServiceMediaService = { slug: string; title: string; type: string; image: string };

export const workAtHeightImages = [
  '/assets/workatheight/WH-01.jpeg',
  '/assets/workatheight/Wh-02.jpeg',
  '/assets/workatheight/Wh-03.jpeg',
  '/assets/workatheight/WH-04.jpeg',
  '/assets/workatheight/Wh-05.jpeg',
  '/assets/workatheight/Wh-06.jpeg',
  '/assets/workatheight/Wh-07.jpeg',
  '/assets/workatheight/Wh-08.jpeg',
  '/assets/workatheight/Wh-09.jpeg',
  '/assets/workatheight/WH-101.jpeg',
];

const categoryImages = {
  chemical: [
    '/assets/chemical-safety/cs-01.jpeg',
    '/assets/chemical-safety/cs-02.jpeg',
    '/assets/chemical-safety/cs-03.jpeg',
    '/assets/chemical-safety/cs-04.jpeg',
    '/assets/chemical-safety/cs-05.jpeg',
    '/assets/chemical-safety/cs-06.jpeg',
  ],
  construction: ['/assets/construction-safety/construction-safety.jpeg'],
  environment: [
    '/assets/environment/env-01.jpeg',
    '/assets/environment/envn-02.jpeg',
    '/assets/environment/env-03.jpeg',
    '/assets/environment/env-04.jpeg',
    '/assets/environment/env-05.jpeg',
    '/assets/environment/env-06.jpeg',
  ],
  firstAid: [
    '/assets/first-aid/FA-01.jpeg',
    '/assets/first-aid/FA-02.jpeg',
    '/assets/first-aid/FA-03.jpeg',
    '/assets/first-aid/FA-04.jpeg',
    '/assets/first-aid/FA-06.jpeg',
    '/assets/first-aid/FA-07.jpeg',
  ],
  fire: [
    '/assets/fire/fire-01.jpeg',
    '/assets/fire/fire-010.mp4',
    '/assets/fire/fire-02.jpeg',
    '/assets/fire/fire-03.jpeg',
    '/assets/fire/fire-04.jpeg',
    '/assets/fire/fire-05.jpeg',
    '/assets/fire/fire-06.jpeg',
    '/assets/fire/fire-07.jpeg',
    '/assets/fire/fire-08.jpeg',
    '/assets/fire/fire-09.jpeg',
  ],
  osh: [
    '/assets/osh-committee/osh-01.jpeg',
    '/assets/osh-committee/osh-02.jpeg',
    '/assets/osh-committee/osh-03.jpeg',
  ],
};

function mediaGroup(service: ServiceMediaService): keyof typeof categoryImages | null {
  const slug = service.slug.toLowerCase();
  const title = service.title.toLowerCase();
  const type = service.type.toLowerCase();

  if (slug.includes('chemical') || title.includes('chemical')) return 'chemical';
  if (slug.includes('work-at-height') || title.includes('work at height')) return null;
  if (slug.includes('construction') || title.includes('construction')) return 'construction';
  if (slug.includes('fire') || title.includes('fire')) return 'fire';
  if (slug.includes('first-aid') || title.includes('first aid')) return 'firstAid';
  if (type.includes('environmental') || title.includes('environment')) return 'environment';
  if (slug.includes('osh') || title.includes('osh') || title.includes('committee')) return 'osh';
  return null;
}

function altFor(service: ServiceMediaService, image: string) {
  if (image.endsWith('.mp4')) return `${service.title} safety video`;
  return `${service.title} workplace safety imagery`;
}

export function getServiceMediaSlides(service: ServiceMediaService): ServiceMediaSource[] {
  const group = mediaGroup(service);
  const images = group === null
    ? service.slug.toLowerCase().includes('work-at-height') || service.title.toLowerCase().includes('work at height')
      ? workAtHeightImages
      : []
    : categoryImages[group];
  const image = service.image.trim();
  const externalImage = /^https?:\/\//i.test(image) ? image : '';
  const orderedImages = [
    ...(externalImage ? [externalImage] : []),
    ...images,
    ...(image && !externalImage && !images.includes(image) ? [image] : []),
  ];
  const uniqueImages = [...new Set(orderedImages)];
  return uniqueImages.map(source => ({ image: source, alt: altFor(service, source) }));
}
