import manifest from '@neos-project/neos-ui-extensibility';
import PreviewButton from './PreviewButton';

manifest('Kiltau.MultisitePreview:PreviewButton', {}, globalRegistry => {
  const containerRegistry = globalRegistry.get('containers');
  containerRegistry.set('SecondaryToolbar/Right/PreviewButton', PreviewButton);
});
