// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const path = require('path');

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
    title: 'Trezoa Pay Docs',
    tagline:
        'Trezoa Pay is a standard protocol and set of reference implementations that enable developers to incorporate decentralized payments into their apps and services.',
    url: 'https://docs.trezoapay.com',
    baseUrl: '/',
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',
    favicon: 'img/favicon.ico',
    organizationName: 'trzledgerfoundation', // Usually your GitHub org/user name.
    projectName: 'trezoa-pay', // Usually your repo name.

    presets: [
        [
            'classic',
            /** @type {import('@docusaurus/preset-classic').Options} */
            ({
                docs: {
                    sidebarPath: require.resolve('./sidebars.js'),
                    sidebarCollapsed: false,
                    path: 'src',
                    routeBasePath: '/',
                    editUrl: 'https://github.com/trzledgerfoundation/trezoa-pay/tree/master/docs',
                },
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
            }),
        ],
    ],

    themeConfig:
        /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
        ({
            colorMode: {
                defaultMode: 'dark',
                respectPrefersColorScheme: true,
                switchConfig: {
                    darkIcon: '🌙',
                    darkIconStyle: {
                        marginLeft: '2px',
                    },
                    lightIcon: '☀️',
                    lightIconStyle: {
                        marginLeft: '1px',
                    },
                },
            },
            navbar: {
                logo: {
                    alt: 'Trezoa Logo',
                    src: 'img/logo-horizontal.svg',
                    srcDark: 'img/logo-horizontal-dark.svg',
                },
                items: [
                    {
                        href: 'https://github.com/trzledgerfoundation/trezoa-pay',
                        label: 'GitHub',
                        position: 'right',
                    },
                    {
                        to: 'api',
                        label: 'API Reference',
                        position: 'left',
                    },
                ],
            },
            footer: {
                style: 'dark',
                links: [
                    {
                        title: 'Community',
                        items: [
                            {
                                label: 'Stack Exchange',
                                href: 'https://trezoa.stackexchange.com',
                            },
                            {
                                label: 'Twitter',
                                href: 'https://twitter.com/trezoa',
                            },
                            {
                                label: 'Forums',
                                href: 'https://forums.trezoa.com',
                            },
                        ],
                    },
                    {
                        title: 'More',
                        items: [
                            {
                                label: 'GitHub',
                                href: 'https://github.com/trzledgerfoundation/trezoa-pay',
                            },
                        ],
                    },
                ],
                copyright: `Copyright © ${new Date().getFullYear()} Trezoa Foundation`,
            },
            prism: {
                theme: lightCodeTheme,
                darkTheme: darkCodeTheme,
            },
        }),

    plugins: [
        [
            'docusaurus-plugin-typedoc-api',
            {
                projectRoot: path.join(__dirname, '..'),
                packages: ['core'],
                typedocOptions: {
                    excludeInternal: true,
                    excludePrivate: true,
                },
                tsconfigName: 'core/tsconfig.json',
            },
        ],
    ],
};

module.exports = config;
