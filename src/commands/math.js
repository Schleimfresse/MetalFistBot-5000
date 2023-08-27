import { createCanvas } from "canvas";
import { AttachmentBuilder, EmbedBuilder } from "discord.js";
import config from "../config/config.js";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
const client = config.CLIENT;

async function mandelbrot(interaction) {
	await interaction.deferReply();
	let maxIterations = interaction.options.getNumber("iterations");
	let zoom = interaction.options.getNumber("zoom");
	if (zoom === null) {
		zoom = 500;
	}
	if (zoom <= 0) {
		return interaction.editReply("The zoom cannot be set below 1");
	}
	if (maxIterations > 10000) {
		return interaction.editReply("The zoom cannot be set above 10000");
	}
	if (maxIterations === null) {
		maxIterations = 1000;
	}
	if (maxIterations <= 0) {
		return interaction.editReply("The iterations cannot be set below 1");
	}
	if (maxIterations > 5000) {
		return interaction.editReply("The iterations cannot be set above 5000");
	}
	const width = 1920;
	const height = 1080;
	const threshold = 100;
	const centerX = -0.5;
	const centerY = 0;
	const canvas = createCanvas(1920, 1080);
	const context = canvas.getContext("2d");

	function mandelbrot(cReal, cImaginary) {
		let real = 0;
		let imaginary = 0;

		for (let i = 0; i < maxIterations; i++) {
			const nextReal = real * real - imaginary * imaginary + cReal;
			const nextImaginary = 2 * real * imaginary + cImaginary;

			real = nextReal;
			imaginary = nextImaginary;

			if (real * real + imaginary * imaginary > threshold) {
				return i;
			}
		}

		return maxIterations;
	}

	function getColor(iterations) {
		if (iterations === maxIterations) {
			return "black";
		} else {
			const gradientValue = iterations / maxIterations;
			const hue = 240 * gradientValue;
			return `hsl(${hue}, 100%, 50%)`;
		}
	}

	for (let x = 0; x < width; x++) {
		for (let y = 0; y < height; y++) {
			const cReal = (x - width / 2) / zoom + centerX;
			const cImaginary = (y - height / 2) / zoom + centerY;

			const iterations = mandelbrot(cReal, cImaginary, maxIterations);

			// for colored canvas
			const color = getColor(iterations);

			// For only black and white
			//const colorValue = Math.floor(iterations * 255);
			//const color = `rgb(${colorValue}, ${colorValue}, ${colorValue})`;

			context.fillStyle = color;
			context.fillRect(x, y, 1, 1);
		}
	}

	const imageBuffer = canvas.toBuffer();
	const attachment = new AttachmentBuilder(imageBuffer, "image.png");

	const botAvatar = client.user.displayAvatarURL();
	const Embed = new EmbedBuilder()
		.setColor(0xffcc00)
		.setAuthor({ name: "MetalFistBot 5000 | Mandelbrot set", iconURL: botAvatar })
		.setTitle("1920px x 1080px Mandelbrot set")
		.setImage("attachment://image.png")
		.setDescription(`Iterations: ${maxIterations}\nZoom: ${zoom}\n Calculated after: Zₙ₊₁ = Zₙ² + 𝑐`)
		.setTimestamp(interaction.createdAt)
		.setFooter({ text: `Requested by ${interaction.user.username}` });
	interaction.editReply({ embeds: [Embed], files: [attachment] });
}

async function functions(interaction) {
	await interaction.deferReply();
	let input = interaction.options.getString("input");

	try {
		const graphBuffer = await generateGraphBuffer();
		console.log(graphBuffer);
		const attachment = new AttachmentBuilder(graphBuffer, "image.png");
		const botAvatar = client.user.displayAvatarURL();
		const Embed = new EmbedBuilder()
			.setColor(0xffcc00)
			.setAuthor({ name: "MetalFistBot 5000 | function", iconURL: botAvatar })
			.setTitle(`Graph of ${input}`)
			.setImage("attachment://image.png")
			.setTimestamp(interaction.createdAt)
			.setFooter({ text: `Requested by ${interaction.user.username}` });
		interaction.editReply({ embeds: [Embed], files: [attachment] });
	} catch (err) {
		interaction.editReply("Error: Invalid expression or graphing error.");
		console.log(err);
	}

	async function generateGraphBuffer() {
		const match = input.match(/f\(x\) = (.+)/);
		if (!match) {
			interaction.editReply('Invalid function format. Use "f(x) = expression".');
		}

		const functionExpression = match[1];

		const graphData = evaluateFunction(functionExpression);
		const graphUrl = await generateGraph(graphData);
		return graphUrl;
	}

	function evaluateFunction(expression) {
		const points = [];
		for (let x = -10; x <= 10; x += 0.1) {
			const y = eval(expression);
			const y_rounded = y.toFixed(4)
			const x_rounded = x.toFixed()
			points.push({ x_rounded, y_rounded });
		}
		console.log(points);
		return points;
	}

	async function generateGraph(graphData) {
		console.log("generate graph");
		const width = 1920;
		const height = 1080;
		const backgroundColour = "white";
		const type = "png";
		try {
			const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour, type });

			const config = {
				type: "scatter",
				data: {
					datasets: [
						{
							label: "Test",
							data: graphData
						},
					],
				},
				options: {
					responsive: true,
				},
			};
			const Data = chartJSNodeCanvas.renderToBufferSync(config);
			return Data;
		} catch (err) {
			interaction.editReply("Not able to generate chart!");
		}
	}
}

export default { mandelbrot, functions };
