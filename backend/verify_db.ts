import prisma from './src/utils/prisma';

async function main() {
  try {
    const result: any[] = await prisma.$queryRawUnsafe('DESCRIBE equipo_miembros');
    console.log('TABLE_DESC:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
