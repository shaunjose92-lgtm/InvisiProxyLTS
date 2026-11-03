import {
	Keywords,
	Splash,
	Inline,
	route,
	values,
	SEO,
	translate,
	Translation,
	titled,
} from '../document-helpers.tsx';
import {
	AosScripts,
	ParticlesScript,
	PageScripts,
} from '../components/HeadScripts.tsx';
import HeadContent from '../components/HeadContent.tsx';
import AntiExfil from '../components/AntiExfil.tsx';
import Header from '../components/Header.tsx';
import Footer from '../components/Footer.tsx';
import Placements from '../components/Placements.tsx';

const links = {
	browse: (text: string) => <a href={route('/browsing')}>{text}</a>,
	docs: (text: string) => (
		<a
			href={route('/documentation')}
			title={translate('home.hosting.docsTitle')}
		>
			{text}
		</a>
	),
	github: (text: string) => (
		<a
			href={route('/github')}
			title={translate('home.githubTitle')}
			target="_blank"
			rel="noopener noreferrer"
		>
			{text}
		</a>
	),
	nord: (text: string) => (
		<a
			href="https://nordtheme.com"
			target="_blank"
			rel="noopener noreferrer"
		>
			{text}
		</a>
	),
	patreon: (text: string) => (
		<a
			href={route('/patreon')}
			aria-label={translate('home.overview.patreonLabel')}
			target="_blank"
			rel="noopener noreferrer"
		>
			{text}
		</a>
	),
	underline: () => <span class="underline-svg"></span>,
};

export default function Home() {
	return (
		<>
			<Keywords />
			<AntiExfil />
			<nav id="header" class="fullwidth" aria-label="Main navigation">
				<Header />
			</nav>
			{values.showSplash && (
				<div id="banner" class="fullwidth">
					<p class="text-center">
						<Splash />
					</p>
				</div>
			)}
			<div id="mainbody" class="fullwidth">
				<div id="background" class="fullwidth"></div>
				<section
					class="home-grid-container"
					aria-label="Home Grid Container"
				>
					<div class="home-text">
						<h1>
							<span>{translate('home.headline')}</span>
						</h1>
						<h1>{translate('home.tagline')}</h1>
						<a class="homebutton" href="#scrollfix">
							{translate('home.browseNow')}
						</a>
						<a class="homebutton mobile" href="#scrollfix">
							{translate('home.browseNow')}
						</a>
					</div>
					<Keywords />
					<section class="cipher-home-preview" aria-label="Cipher Browser at a glance">
						<div class="cipher-home-preview-top"><span class="cipher-home-dot"></span><span class="cipher-home-preview-name">CIPHER BROWSER / START</span><span class="cipher-home-preview-state">ONLINE</span></div>
						<div class="cipher-home-preview-core"><div class="cipher-home-preview-mark">C</div><p>Everything you need, one browser.</p><span>Tabs, bookmarks, transport controls, privacy settings and quick access to your favourite sites.</span><a href={route('/browsing')}>Open Cipher Browser <i class="fas fa-arrow-right" aria-hidden="true"></i></a></div>
					</section>
				</section>
				<Keywords />
				<div id="scrollfix">­</div>
				<div data-aos="fade-right" class="hero-grid-container">
					<div class="box-hero">
						<div class="hero-content">
							<div class="hero-text-wrap">
								<div class="brand-logo-container">
									<i class="far fa-window-restore palered"></i>
									<h2 class="hero-content-header">
										{translate('home.free.title')}
									</h2>
								</div>
								<p>
									<Translation id="home.free.body" />
								</p>
								<div class="brand-logo-container">
									<i class="far fa-window-restore palered"></i>
									<h2 class="hero-content-header">
										{translate('home.fast.title')}
									</h2>
								</div>
								<p>{translate('home.fast.body')}</p>
								<div class="brand-logo-container">
									<i class="far fa-window-restore palered"></i>
									<h2 class="hero-content-header">
										{translate('home.practical.title')}
									</h2>
								</div>
								<p>
									<Translation id="home.practical.body" />
								</p>
							</div>
						</div>
						<div class="image-container-hero">
							<img
								class="hero"
								src={route('/assets/img/logo-light.webp')}
								alt={translate('home.logoAlt')}
							/>
							<h1>Cipher Browser</h1>
							<h2>{translate('home.heroSubtitle')}</h2>
							<a
								class="fancybutton glowbutton"
								href={route('/browsing')}
							>
								{translate('home.browseNow')}
							</a>
							<a
								class="fancybutton glowbutton"
								href={route('/patreon')}
								target="_blank"
								rel="noopener noreferrer"
							>
								{translate('home.donate')}
							</a>
						</div>
					</div>
				</div>
				<Keywords />
				<div data-aos="fade-right" class="carousel-container">
					<div class="carousel-wrapper">
						<div class="carousel">
							<div class="carousel-inner">
								<div class="dependencylogo">
									<img
										loading="lazy"
										src={route('/assets/img/vite.webp')}
										alt="Vite"
									/>
								</div>
								<div class="dependencylogo">
									<img
										loading="lazy"
										src={route('/assets/img/solid.webp')}
										alt="SolidJS"
									/>
								</div>
								<div class="dependencylogo">
									<img
										loading="lazy"
										src={route(
											'/assets/img/nordtheme.webp'
										)}
										alt="Nord Theme"
									/>
								</div>
								<div class="dependencylogo">
									<img
										loading="lazy"
										src={route('/assets/img/nodejs.webp')}
										alt="Nodejs"
									/>
								</div>
								<div class="dependencylogo">
									<img
										loading="lazy"
										src={route(
											'/assets/img/fontawesome.webp'
										)}
										alt="Font Awesome"
									/>
								</div>
								<div class="dependencylogo">
									<img
										loading="lazy"
										src={route('/assets/img/scramjet.png')}
										alt="Scramjet"
									/>
								</div>
								<div class="dependencylogo">
									<img
										loading="lazy"
										src={route('/assets/img/vite.webp')}
										alt="Vite"
									/>
								</div>
								<div class="dependencylogo">
									<img
										loading="lazy"
										src={route('/assets/img/solid.webp')}
										alt="SolidJS"
									/>
								</div>
								<div class="dependencylogo">
									<img
										loading="lazy"
										src={route(
											'/assets/img/nordtheme.webp'
										)}
										alt="Nord Theme"
									/>
								</div>
								<div class="dependencylogo">
									<img
										loading="lazy"
										src={route('/assets/img/nodejs.webp')}
										alt="Nodejs"
									/>
								</div>
								<div class="dependencylogo">
									<img
										loading="lazy"
										src={route(
											'/assets/img/fontawesome.webp'
										)}
										alt="Font Awesome"
									/>
								</div>
								<div class="dependencylogo">
									<img
										loading="lazy"
										src={route('/assets/img/scramjet.png')}
										alt="Scramjet"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
				<Keywords />
				<div class="text-center">
					<div class="splashstroke">
						<div>
							<h1 class="splashstrokeheader">
								<Translation
									id="home.designedWithPrivacy"
									tags={links}
								/>
							</h1>
						</div>
						<svg
							aria-hidden="true"
							class="underline-svg"
							viewBox="0 0 390 55"
							fill="none"
						>
							<defs>
								<linearGradient
									gradientUnits="userSpaceOnUse"
									x1="192.539"
									y1="1.537"
									x2="192.539"
									y2="51.098"
									id="gradient-0"
									gradientTransform="matrix(-0.001215, 0.999999, -7.795296, -0.009463, 402.484802, -163.600372)"
								>
									<stop
										offset="0"
										style="stop-color: rgba(135, 149, 221, 1)"
									></stop>
									<stop
										offset="1"
										style="stop-color: rgba(56, 80, 198, 1)"
									></stop>
								</linearGradient>
							</defs>
							<path
								style={
									'\n                stroke: url(#gradient-0);\n                stroke-width: 2px;\n                stroke-linecap: round;\n              '
								}
								d="M 3 8.997 C 3 8.997 386.2758229569146 -1.5119911685214125 386.872 5.292 C 387.1840859001393 8.853743500517725 283.1432491171007 17.09919545317559 283.106 22.586 C 283.07461319934777 27.209283823450303 356.0628379238926 30.04524568361604 356.607 35.864 C 357.0292218177662 40.3788405823717 314.606 51.924 314.606 51.924"
							></path>
						</svg>
					</div>
				</div>
				<Keywords />
				<div class="grid-container">
					<div data-aos="fade-right" id="info" class="box-card">
						<div class="content">
							<div class="text-wrap">
								<h1>{translate('home.overview.title')}</h1>
								<p>{translate('home.overview.body')}</p>
								<p>
									<Translation
										id="home.overview.donate"
										tags={links}
									/>
								</p>
							</div>
						</div>
						<div class="image-container">
							<img
								class="hero"
								src={route('/assets/img/server.webp')}
								alt={translate('home.overview.imageAlt')}
							/>
						</div>
					</div>
					<div data-aos="fade-left" class="box-card">
						<div class="content">
							<div class="text-wrap">
								<h1>{translate('home.intent.title')}</h1>
								<p>{translate('home.intent.body')}</p>
								<p>
									<Translation
										id="home.intent.palette"
										tags={links}
									/>
								</p>
							</div>
						</div>
						<div class="image-container">
							<img
								class="hero"
								src={route('/assets/img/filecode.webp')}
								alt={translate('home.intent.imageAlt')}
							/>
						</div>
					</div>
					<div data-aos="fade-right" class="box-card">
						<div class="content">
							<div class="text-wrap">
								<h1>{translate('home.usage.title')}</h1>
								<p>
									<Translation
										id="home.usage.body"
										tags={links}
									/>
								</p>
							</div>
						</div>
						<div class="image-container">
							<img
								class="hero"
								src={route('/assets/img/shield.webp')}
								alt={translate('home.usage.imageAlt')}
							/>
						</div>
					</div>
					<div data-aos="fade-left" class="box-card">
						<div class="content">
							<div class="text-wrap">
								<h1>{translate('home.apps.title')}</h1>
								<p>{translate('home.apps.body')}</p>
							</div>
						</div>
						<div class="image-container">
							<img
								class="hero"
								src={route('/assets/img/apps.webp')}
								alt={translate('home.apps.imageAlt')}
							/>
						</div>
					</div>
					<div data-aos="fade-right" class="box-card">
						<div class="content">
							<div class="text-wrap">
								<h1>{translate('home.hosting.title')}</h1>
								<p>
									<Translation
										id="home.hosting.body"
										tags={links}
									/>
								</p>
							</div>
						</div>
						<div class="image-container">
							<img
								class="hero"
								src={route('/assets/img/hosting.webp')}
								alt={translate('home.hosting.imageAlt')}
								title={translate('home.hosting.imageTitle')}
							/>
						</div>
					</div>
					<div data-aos="fade-left" class="box-card">
						<div class="content">
							<div class="text-wrap">
								<h1>{translate('home.contributing.title')}</h1>
								<p>
									<Translation id="home.contributing.body" />
								</p>
								<p>
									<Translation
										id="home.contributing.start"
										tags={links}
									/>
								</p>
							</div>
						</div>
						<div class="image-container">
							<img
								class="hero"
								src={route('/assets/img/git.webp')}
								alt={translate('home.contributing.imageAlt')}
								title={translate(
									'home.contributing.imageTitle'
								)}
							/>
						</div>
					</div>
				</div>
				<div data-aos="fade-left" class="hero-grid-container">
					<div class="box-hero">
						<div class="hero-content">
							<div class="hero-text-wrap">
								<div class="brand-logo-container">
									<i class="far fa-window-restore palered"></i>
									<h2 class="hero-content-header">
										{translate('home.bypass.title')}
									</h2>
								</div>
								<p>
									<Translation id="home.bypass.body" />
								</p>
								<div class="brand-logo-container">
									<i class="far fa-window-restore palered"></i>
									<h2 class="hero-content-header">
										{translate('home.freeProxy.title')}
									</h2>
								</div>
								<p>
									<Translation id="home.freeProxy.body" />
								</p>
								<div class="brand-logo-container">
									<i class="far fa-window-restore palered"></i>
									<h2 class="hero-content-header">
										{translate('home.tor.title')}
									</h2>
								</div>
								<p>
									<Translation id="home.tor.body" />
								</p>
							</div>
						</div>
						<Keywords />
						<div class="image-container-hero">
							<h1>{translate('home.unrestricted')}</h1>
							<a
								class="fancybutton glowbutton"
								href={route('/browsing')}
							>
								{translate('home.bypassNow')}
							</a>
						</div>
					</div>
				</div>
				<div class="box-home text-center splashend">
					<h1>{translate('home.closing')}</h1>
					<a class="homebutton" href="#scrollfix">
						{translate('home.tryFree')}
					</a>
					<a class="homebutton mobile" href={route('/browsing')}>
						{translate('home.tryFree')}
					</a>
				</div>
			</div>
			<Placements />
			<div id="footer" class="fullwidth">
				<Footer />
			</div>
			<Keywords />
			<Inline>
				<script src={route('assets/js/card.js', 'inline')} />
			</Inline>
		</>
	);
}

export function Head() {
	return (
		<>
			<meta http-equiv="x-ua-compatible" content="IE=edge" />
			<SEO>
				<meta name="version" content={values.version} />
				<meta name="googlebot" content="index, follow, snippet" />
				<meta
					name="robots"
					content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
				/>
				<meta name="author" content="QuiteAFancyEmerald" />
				<meta name="application-name" content="Cipher Browser" />
			</SEO>
			<title>
				{titled(
					translate('home.title'),
					translate('header.overview.label')
				)}
			</title>
			<SEO>
				<meta
					name="description"
					content={translate('home.description')}
				/>
				<meta
					name="Keywordss"
					content="web proxy, free web proxy, proxy web browser, proxy web, proxy web page, proxy for web, secure proxy, unblock websites, free proxy, bypass censorship, unblock Chromebook, proxy service, online security, private browsing, unblock social media, access blocked content, proxy server, internet freedom, unblock at school, unblock at work"
				/>
				<meta property="og:site_name" content="Cipher Browser" />
				<meta property="og:title" content={translate('home.title')} />
				<meta property="og:type" content="website" />
				<meta
					property="og:description"
					content={translate('home.ogDescription')}
				/>
			</SEO>
			<meta property="og:image" content={route('assets/img/hero.webp')} />
			<meta
				property="og:image:secure_url"
				content={route('assets/img/hero.webp')}
			/>
			<SEO>
				<meta
					property="og:image:alt"
					content={translate('common.logoAlt')}
				/>
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:site" content="@titaniumnetdev" />
				<meta name="twitter:creator" content="@titaniumnetdev" />
				<meta name="twitter:title" content={translate('home.title')} />
				<meta
					name="twitter:description"
					content={translate('home.twitterDescription')}
				/>
				<meta
					name="twitter:image"
					content={route('assets/img/hero.webp')}
				/>
				<meta
					name="twitter:image:alt"
					content={translate('common.logoAlt')}
				/>
			</SEO>
			<meta name="msapplication-TileColor" content="#b4213b" />
			<meta
				name="msapplication-TileImage"
				content={route('assets/ico/ms-icon-144x144.png')}
			/>
			<meta name="apple-mobile-web-app-capable" content="yes" />
			<meta
				name="apple-mobile-web-app-status-bar-style"
				content="black-translucent"
			/>
			<SEO>
				<meta
					name="apple-mobile-web-app-title"
					content="Cipher Browser"
				/>
			</SEO>
			<HeadContent />
			<ParticlesScript />
			<AosScripts />
			<PageScripts />
			<link
				rel="mask-icon"
				href={route('assets/svg/new.svg')}
				color="#b4213b"
			/>
			<link rel="manifest" href={route('manifest.json')} />
			<meta name="mobile-web-app-capable" content="yes" />
			<SEO>
				<meta name="description" content="Cipher Browser is a Cipher-branded web proxy based on the open-source InvisiProxy LTS project. Some sign-ins and websites may not function through a proxy." />
			</SEO>
		</>
	);
}
