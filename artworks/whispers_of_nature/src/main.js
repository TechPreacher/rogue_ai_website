class LandscapeAnimation {
    constructor() {
        const canvas = document.getElementById('landscape');
        if (!(canvas instanceof HTMLCanvasElement)) throw new Error('Canvas not found');
        this.canvas = canvas;
        const ctx = this.canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get 2D context');
        this.ctx = ctx;
        this.time = 0;
        this.hills = [];
        this.clouds = [];
        this.leaves = [];
        this.baseHue = Math.random() * 360;
        
        this.resizeCanvas();
        this.initializeElements();
        window.addEventListener('resize', () => this.resizeCanvas());
        requestAnimationFrame(() => this.animate());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    initializeElements() {
        // Initialize hills
        for (let i = 0; i < 5; i++) {
            this.hills.push({
                x: Math.random() * this.canvas.width,
                height: 100 + Math.random() * 200,
                speed: 0.2 + Math.random() * 0.3
            });
        }

        // Initialize clouds
        for (let i = 0; i < 10; i++) {
            this.clouds.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * (this.canvas.height * 0.5),
                size: 30 + Math.random() * 100,
                speed: 0.5 + Math.random() * 1
            });
        }

        // Initialize leaves
        for (let i = 0; i < 20; i++) {
            this.leaves.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: 5 + Math.random() * 10,
                rotation: Math.random() * Math.PI * 2,
                speed: 1 + Math.random() * 2
            });
        }
    }

    drawHills() {
        this.hills.forEach((hill, index) => {
            const gradient = this.ctx.createLinearGradient(0, this.canvas.height - hill.height, 0, this.canvas.height);
            const hue = (this.baseHue + index * 20) % 360;
            gradient.addColorStop(0, `hsl(${hue}, 70%, 40%)`);
            gradient.addColorStop(1, `hsl(${hue}, 70%, 30%)`);

            this.ctx.beginPath();
            this.ctx.moveTo(0, this.canvas.height);
            
            for (let x = 0; x <= this.canvas.width; x += 10) {
                const relativeX = x + hill.x * (index + 1);
                const y = this.canvas.height - hill.height * 
                    Math.sin((relativeX * 0.003) + Math.sin(this.time * 0.001 * hill.speed));
                this.ctx.lineTo(x, y);
            }

            this.ctx.lineTo(this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        });
    }

    drawClouds() {
        this.clouds.forEach(cloud => {
            this.ctx.beginPath();
            this.ctx.fillStyle = `rgba(255, 255, 255, 0.8)`;
            
            for (let i = 0; i < 5; i++) {
                const offsetX = Math.sin(this.time * 0.001 + i) * 10;
                const offsetY = Math.cos(this.time * 0.001 + i) * 5;
                this.ctx.arc(
                    cloud.x + i * (cloud.size * 0.5) + offsetX,
                    cloud.y + offsetY,
                    cloud.size * 0.3,
                    0,
                    Math.PI * 2
                );
            }
            
            this.ctx.fill();
            
            cloud.x += cloud.speed;
            if (cloud.x > this.canvas.width + cloud.size) {
                cloud.x = -cloud.size;
            }
        });
    }

    drawLeaves() {
        this.leaves.forEach(leaf => {
            this.ctx.save();
            this.ctx.translate(leaf.x, leaf.y);
            this.ctx.rotate(leaf.rotation + this.time * 0.002);
            
            this.ctx.beginPath();
            this.ctx.fillStyle = `hsl(${(this.baseHue + 120) % 360}, 70%, 40%)`;
            this.ctx.ellipse(0, 0, leaf.size, leaf.size * 2, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
            
            leaf.x += Math.sin(this.time * 0.001) * leaf.speed;
            leaf.y += Math.cos(this.time * 0.001) * leaf.speed + 1;
            leaf.rotation += 0.02;
            
            if (leaf.y > this.canvas.height + leaf.size) {
                leaf.y = -leaf.size;
                leaf.x = Math.random() * this.canvas.width;
            }
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.baseHue = (this.baseHue + 0.1) % 360;
        
        this.drawHills();
        this.drawClouds();
        this.drawLeaves();
        
        this.time++;
        requestAnimationFrame(() => this.animate());
    }
}

// Start the animation when the page loads
window.addEventListener('load', () => {
    new LandscapeAnimation();
});
