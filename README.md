# Snake Game with AI Opponent

## Overview
An advanced implementation of the classic Snake game built with vanilla JavaScript, featuring an AI-controlled enemy snake and dynamic difficulty progression.

## Key Features
- Player-controlled snake with traditional mechanics
- AI opponent that actively seeks food and avoids collisions 
- Dynamic difficulty scaling through levels
- Obstacle generation that adapts to game level
- Configurable border behavior (wrap-around or collision)
- Food items with time-based expiration
- Score tracking and high score system
- Customizable starting level
- Responsive controls and smooth animations

## Technical Highlights
- Pure JavaScript implementation without external game engines
- Custom pathfinding algorithm for AI snake behavior
- Object-oriented design for game entities
- Modular code architecture split across multiple files:
 - [`ormen.js`](/src/js/ormen.js): Core game logic and mechanics
 - [`ai.js`](/src/js/ai.js): Enemy snake AI implementation 
 - [`block-spawner.js`](/src/js/block-spawner.js): Obstacle generation and management

## AI Implementation
The enemy snake uses a distance-based pathfinding algorithm that:
- Calculates optimal paths to food
- Avoids collisions with obstacles, walls, and other snakes
- Makes dynamic movement decisions based on current game state
- Implements forward-only movement restrictions

## Game Mechanics
- Players score points by collecting food items
- Snake length increases with food consumption
- Food items expire based on distance from player
- Obstacles increase in complexity with level progression
- Game over conditions include:
 - Collision with obstacles
 - Collision with enemy snake
 - Self-collision
 - Border collision (when configured)
 - Snake length becoming too short

## Technical Details
- Canvas-based rendering
- Collision detection system
- Event-driven architecture
- Configurable game parameters
- Bootstrap for UI elements

## Future Development Possibilities
- Additional AI behaviors
- Multiple game modes
- Power-ups and special abilities
- Multiplayer support
- Mobile touch controls
- Localization support

## Development History
The game was developed incrementally with multiple iterations, each adding new features and refinements:
- V1-V3: Core gameplay mechanics
- V4: Initial AI implementation
- V5: Enhanced AI behavior and obstacle system
- V6: Polished gameplay and configurability

## Code Quality
- Structured with clear separation of concerns
- Well-documented functions and modules
- Consistent coding style and naming conventions
- Optimized for performance and maintainability

This project demonstrates proficiency in:
- JavaScript game development
- AI algorithm implementation
- Object-oriented programming
- Canvas manipulation
- Event handling