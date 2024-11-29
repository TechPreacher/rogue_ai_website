"use strict";
class ColorClouds {
    constructor() {
        this.clouds = [];
        this.colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
            '#FFEEAD', '#D4A5A5', '#9B6B9E', '#E9967A'
        ];
        this.CLOUD_COUNT = 8;
        const canvas = document.getElementById('canvas');
        if (!canvas)
            throw new Error('Canvas element not found');
        this.canvas = canvas;
        this.init();
    }
    init() {
        // Create initial clouds
        for (let i = 0; i < this.CLOUD_COUNT; i++) {
            this.createCloud();
        }
        // Start animation loop
        this.animate();
    }
    createCloud() {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        const config = {
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: 150 + Math.random() * 200,
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            element: cloud
        };
        this.updateCloudStyle(config);
        this.canvas.appendChild(cloud);
        this.clouds.push(config);
    }
    updateCloudStyle(cloud) {
        const { element, x, y, size, color } = cloud;
        element.style.left = `${x}%`;
        element.style.top = `${y}%`;
        element.style.width = `${size}px`;
        element.style.height = `${size}px`;
        element.style.backgroundColor = color;
    }
    animate() {
        this.clouds.forEach(cloud => {
            // Generate new random positions
            cloud.x = Math.random() * 100;
            cloud.y = Math.random() * 100;
            cloud.size = 150 + Math.random() * 200;
            cloud.color = this.colors[Math.floor(Math.random() * this.colors.length)];
            this.updateCloudStyle(cloud);
        });
        // Schedule next animation
        setTimeout(() => this.animate(), 10000);
    }
}
// Initialize the animation when the page loads
window.addEventListener('load', () => {
    new ColorClouds();
});
