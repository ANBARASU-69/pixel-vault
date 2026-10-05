const g = (id, name, genre, price, rating, desc) => ({ id, name, genre, price, rating, desc, image: `/images/${id}.svg` });
module.exports = [
 g(1,"Cyber Racer 2077","Racing",799,4.5,"Street race through a neon megacity with fully tunable cars and online leaderboards."),
 g(2,"Dungeon Forge","RPG",999,4.7,"Craft legendary weapons, descend into procedural dungeons and build your guild."),
 g(3,"Sky Battalion","Action",649,4.2,"Fast aerial dogfights across 40 missions with co-op squads of up to four pilots."),
 g(4,"Farm Valley Days","Simulation",399,4.6,"Grow crops, raise animals and befriend a whole village in this relaxing farm sim."),
 g(5,"Shadow Ninja","Action",549,4.3,"Stealth, parkour and blade combat in feudal Japan. Every shadow is a weapon."),
 g(6,"Galaxy Tactics","Strategy",899,4.4,"Command fleets, research technologies and conquer a hand-crafted galaxy."),
 g(7,"Puzzle Planet","Puzzle",199,4.1,"300 handcrafted puzzles across ten tiny worlds. Easy to learn, hard to put down."),
 g(8,"Dragon Realm","RPG",1299,4.8,"An open-world fantasy epic with a 80-hour story, dragons to tame and choices that matter."),
 g(9,"Street Football 24","Sports",699,4.0,"Fast 5-a-side football with online ranked seasons and custom teams."),
 g(10,"Zombie Outpost","Action",449,4.2,"Defend your outpost, scavenge supplies and survive 100 nights of the undead."),
 g(11,"Empire Builder","Strategy",849,4.5,"Grow a tiny village into a world empire through trade, diplomacy and war."),
 g(12,"Neon Drift","Racing",299,4.3,"Arcade drift racing with synthwave music and 25 tracks.")
];
