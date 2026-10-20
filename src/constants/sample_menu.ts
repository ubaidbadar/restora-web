/** Offered during first-run setup as a starting menu (`POST /menu/bulk`). Categories and groups are matched by name. */
const SAMPLE_MENU = {
  addonGroups: [
    { name: 'Extras', min: 0, max: 3, options: [{ name: 'Raita', price: 100 }, { name: 'Salad', price: 80 }, { name: 'Extra naan', price: 60 }] },
    { name: 'Spice level', min: 0, max: 1, options: [{ name: 'Mild', price: 0 }, { name: 'Medium', price: 0 }, { name: 'Hot', price: 0 }] },
  ],
  items: [
    { category: 'Karahi', name: 'Chicken Karahi', sizes: [{ name: 'Half', price: 1250 }, { name: 'Full', price: 2300 }], addons: ['Extras'] },
    { category: 'Karahi', name: 'Mutton Karahi', sizes: [{ name: 'Half', price: 2400 }, { name: 'Full', price: 4600 }], addons: ['Extras'] },
    { category: 'Rice', name: 'Chicken Biryani', sizes: [{ name: 'Single', price: 450 }, { name: 'Double', price: 800 }], addons: ['Extras'] },
    { category: 'Rice', name: 'Beef Pulao', sizes: [{ name: '', price: 520 }], addons: ['Extras'] },
    { category: 'BBQ', name: 'Seekh Kabab (4 pcs)', sizes: [{ name: '', price: 680 }] },
    { category: 'BBQ', name: 'Chicken Tikka', sizes: [{ name: '', price: 420 }] },
    { category: 'Desi', name: 'Daal Mash', sizes: [{ name: '', price: 350 }] },
    { category: 'Bread', name: 'Roghni Naan', sizes: [{ name: '', price: 60 }] },
    { category: 'Bread', name: 'Tandoori Roti', sizes: [{ name: '', price: 25 }] },
    { category: 'Drinks', name: 'Soft Drink', sizes: [{ name: 'Regular', price: 120 }, { name: '1.5 litre', price: 250 }] },
    { category: 'Drinks', name: 'Doodh Patti', sizes: [{ name: '', price: 150 }] },
    { category: 'Drinks', name: 'Lassi', sizes: [{ name: 'Sweet', price: 250 }, { name: 'Salty', price: 250 }] },
  ],
};

export default SAMPLE_MENU;
