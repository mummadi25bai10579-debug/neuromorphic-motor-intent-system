def get_feature_importance(model, features):
    importances = model.feature_importances_
    return dict(zip(features, importances))
