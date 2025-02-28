const cases = {
  budget: {
    name: "Budget Case",
    price: 10,
    items: [
      { name: "Common Knife", value: 5, chance: 50, color: "#b0c3d9" },
      { name: "Rare Pistol", value: 15, chance: 30, color: "#5e98d9" },
      { name: "Epic Rifle", value: 30, chance: 15, color: "#4b69ff" },
      { name: "Legendary AWP", value: 100, chance: 5, color: "#8847ff" }
    ]
  },
  premium: {
    name: "Premium Case",
    price: 25,
    items: [
      { name: "Rare Knife", value: 15, chance: 50, color: "#5e98d9" },
      { name: "Epic Pistol", value: 35, chance: 30, color: "#4b69ff" },
      { name: "Legendary Rifle", value: 75, chance: 15, color: "#8847ff" },
      { name: "Ancient AWP", value: 250, chance: 5, color: "#eb4b4b" }
    ]
  },
  elite: {
    name: "Elite Case",
    price: 50,
    items: [
      { name: "Epic Knife", value: 35, chance: 80, color: "#4b69ff" },
      { name: "Legendary Pistol", value: 80, chance: 10, color: "#8847ff" },
      { name: "Ancient Rifle", value: 150, chance: 8, color: "#eb4b4b" },
      { name: "Mythical AWP", value: 500, chance: 2, color: "#e4ae39" }
    ]
  }
};

export default cases; 