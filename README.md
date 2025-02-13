# Multisite Preview

This package provides a multisite preview button for the Neos backend. Useful for multisites with a data site to manage the content of multiple sites and thus having a possibility to open the preview of the current site in the corresponding frontend.

## Usage

### Default Configuration

#### 1. Add the following to your preview reference node type, e.g. homepage `superTypes`:

```yaml
  Kiltau.MultisitePreview:PreviewReference: true
```

This will allow you to select the preview references for your document node type. This is usually the homepage of a site.

#### 2. Add the following to your Document node type, e.g. blog post `superTypes`:

```yaml
  Kiltau.MultisitePreview:PreviewButton: true
```

This will allow you to select the preview references for your document node type and change the preview button into a dropdown.

### Configuration Override

If you don't want to use the default configuration, you can override the property name in your configuration.

```yaml
Neos:
  Neos:
    Ui:
      frontendConfiguration:
        'Kiltau.MultisitePreview':
          previewReferences: 'yourPropertyName'
```
