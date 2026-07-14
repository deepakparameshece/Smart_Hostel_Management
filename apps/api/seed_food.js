const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedFood() {
  const options = [
    { name: 'Idli Sambar', mealType: 'BREAKFAST' },
    { name: 'Puri Bhaji', mealType: 'BREAKFAST' },
    { name: 'Bread Omelette', mealType: 'BREAKFAST' },
    { name: 'Paneer Butter Masala', mealType: 'LUNCH' },
    { name: 'Veg Thali', mealType: 'LUNCH' },
    { name: 'Chicken Biryani', mealType: 'LUNCH' },
    { name: 'Dal Tadka & Rice', mealType: 'DINNER' },
    { name: 'Veg Pulao', mealType: 'DINNER' },
    { name: 'Egg Curry', mealType: 'DINNER' },
  ];

  for (const opt of options) {
    await prisma.foodOption.create({
      data: opt
    });
  }
}

seedFood()
  .then(() => console.log('Food options seeded!'))
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
