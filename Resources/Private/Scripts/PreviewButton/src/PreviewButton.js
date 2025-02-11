import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import style from './PreviewButton.css';
import { neos } from '@neos-project/neos-ui-decorators';
import mergeClassNames from 'classnames';

@neos(globalRegistry => ({
	i18nRegistry: globalRegistry.get('i18n'),
	dataLoaders: globalRegistry.get('dataLoaders'),
	serverFeedbackHandlers: globalRegistry.get('serverFeedbackHandlers')
}))

@connect(state => ({
	previewUrl: state.ui.contentCanvas.previewUrl,
	crNodes: state.cr.nodes
}))
export default class PreviewButton extends PureComponent {
	static propTypes = {
		previewUrl: PropTypes.string,
		i18nRegistry: PropTypes.object.isRequired,
		dataLoaders: PropTypes.object.isRequired,
		crNodes: PropTypes.object.isRequired,
		serverFeedbackHandlers: PropTypes.object.isRequired
	};

	state = {
		sites: [],
		showDropDown: false
	};

	async getSites(dataLoaders, crNodes) {
		const currentContextNode = crNodes.byContextPath[crNodes.documentNode];
		const currentSite = await dataLoaders.get('NodeLookup').resolveValue({}, currentContextNode.identifier);
		const siteIdentifiers = currentContextNode.properties.previewReferences;

		if (!siteIdentifiers) return;

		const sites = await Promise.all(
			siteIdentifiers.map(async siteIdentifier => {
				const result = await dataLoaders.get('NodeLookup').resolveValue({}, siteIdentifier);
				return {
					name: result[0].label,
					uri: currentSite[0].uri.replace(/(h\w+:\/\/.+?\/)/, result[0].uri)
				};
			})
		);

		this.setState({ sites });
	}

	async componentDidMount() {
		const { dataLoaders, crNodes, serverFeedbackHandlers } = this.props;
		await this.getSites(dataLoaders, crNodes, serverFeedbackHandlers);

		serverFeedbackHandlers.set('Kiltau.PreviewReferencesUpdate', async (feedbackPayload, { store }) => {
			const state = store.getState();
			const { crNodes } = this.props;

			if (feedbackPayload.contextPath === state.cr.nodes.documentNode) {
				await this.getSites(dataLoaders, crNodes);
			}
		});
	}

	async componentDidUpdate(prevProps) {
		const { dataLoaders, crNodes } = this.props;
		if (prevProps.crNodes !== crNodes) {
			await this.getSites(dataLoaders, crNodes);
		}
	}

	toggleDropDown = () => {
		this.setState({ showDropDown: !this.state.showDropDown });
	}

	render() {
		const { previewUrl, i18nRegistry } = this.props;
		const showPreviewText = i18nRegistry.translate('Neos.Neos:Main:showPreview', 'Show preview');

		const preview = [{
			name: showPreviewText,
			uri: previewUrl
		}, ...this.state.sites];

		const previewButtonClassNames = mergeClassNames({
			[style.secondaryToolbar__buttonLink]: true,
			[style['secondaryToolbar__buttonLink--isDisabled']]: !previewUrl
		});

		if (preview.length < 2) {
			return (
				<a
					id="neos-PreviewButton"
					href={previewUrl ? previewUrl : ''}
					target="neosPreview"
					className={previewButtonClassNames}
					aria-label={showPreviewText}
					title={showPreviewText}
				>
					<Icon icon="external-link-alt" />
				</a>
			);
		}

		if (preview.length > 1) {
			return (
				<div style={{ position: 'relative', display: 'inline-block' }}>
					<button
						id="neos-PreviewButton"
						className={previewButtonClassNames}
						aria-label={showPreviewText}
						onClick={this.toggleDropDown}
						aria-active={this.state.showDropDown}
					>
						<Icon icon="external-link-alt" />
					</button>

					<ul
						className={style.secondaryToolbar__dropDown}
						style={{ display: this.state.showDropDown === false ? 'none' : '' }}
					>
						{preview.map(site => (
							<li key={site.name}>
								<a
									key={site.name}
									href={site.uri}
									target="neosPreview"
									className={style.secondaryToolbar__buttonLink}
									aria-label={site.name}
									title={site.name}
								>
									<Icon icon="external-link-alt" />
									<span>{site.name}</span>
								</a>
							</li>
						))}
					</ul>
				</div>
			);
		}

		return (
			<button
				id="neos-PreviewButton"
				className={previewButtonClassNames}
				disabled
				aria-label={showPreviewText}
			>
				<Icon icon="external-link-alt" />
			</button>
		);
	}
}


const Icon = () => {
	return <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="external-link-alt" class="neos-svg-inline--fa neos-fa-external-link-alt fa-w-16 fa-sm iGSxZG_icon _49YZqG_reset external-link-alt" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M432,320H400a16,16,0,0,0-16,16V448H64V128H208a16,16,0,0,0,16-16V80a16,16,0,0,0-16-16H48A48,48,0,0,0,0,112V464a48,48,0,0,0,48,48H400a48,48,0,0,0,48-48V336A16,16,0,0,0,432,320ZM488,0h-128c-21.37,0-32.05,25.91-17,41l35.73,35.73L135,320.37a24,24,0,0,0,0,34L157.67,377a24,24,0,0,0,34,0L435.28,133.32,471,169c15,15,41,4.5,41-17V24A24,24,0,0,0,488,0Z"></path></svg>
};
