class ColorClouds {
    constructor() {
        this.canvas = document.getElementById('canvas');
        if (!this.canvas) throw new Error('Canvas element not found');
        this.clouds = [];
        this.colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
            '#FFEEAD', '#D4A5A5', '#9B6B9E', '#E9967A'
        ];
        this.CLOUD_COUNT = 12;
        this.init();
    }

    init() {
        // Create initial clouds
        for (let i = 0; i < this.CLOUD_COUNT; i++) {
            this.createCloud();
        }
        
        // Start animation loop
        this.animate();
        // Add continuous creation of new clouds
        setInterval(() => this.createCloud(), 5000);
    }

    createCloud() {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        
        const config = {
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: 100 + Math.random() * 300,
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            element: cloud
        };

        this.updateCloudStyle(config);
        this.canvas.appendChild(cloud);
        this.clouds.push(config);

        // Remove old clouds if we have too many
        if (this.clouds.length > this.CLOUD_COUNT * 1.5) {
            const oldCloud = this.clouds.shift();
            oldCloud.element.remove();
        }
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
            cloud.size = 100 + Math.random() * 300;
            cloud.color = this.colors[Math.floor(Math.random() * this.colors.length)];
            
            this.updateCloudStyle(cloud);
        });

        // Schedule next animation
        setTimeout(() => this.animate(), 8000);
    }
}

// Initialize the animation when the page loads
window.addEventListener('load', () => {
    new ColorClouds();
});
