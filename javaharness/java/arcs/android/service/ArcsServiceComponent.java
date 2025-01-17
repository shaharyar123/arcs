package arcs.android.service;

import android.content.Context;
import android.webkit.WebView;

import javax.inject.Singleton;

import arcs.android.api.Annotations.AppContext;
import arcs.android.impl.AndroidHarnessModule;
import arcs.api.ParticlesModule;
import arcs.api.RenderersModule;
import dagger.BindsInstance;
import dagger.Component;

@Singleton
@Component(modules = {AndroidHarnessModule.class, ParticlesModule.class, RenderersModule.class})
public interface ArcsServiceComponent {

  void inject(ArcsService arcsService);

  @Component.Builder
  interface Builder {
    @BindsInstance
    Builder appContext(@AppContext Context appContext);

    @BindsInstance
    Builder webView(WebView webView);

    ArcsServiceComponent build();
  }
}
