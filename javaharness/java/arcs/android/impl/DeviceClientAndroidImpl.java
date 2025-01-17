package arcs.android.impl;

import android.util.Log;
import android.webkit.JavascriptInterface;
import arcs.api.ArcsEnvironment;
import arcs.api.DeviceClientImpl;
import arcs.api.PecPortManager;
import arcs.api.PortableJsonParser;
import arcs.api.UiBroker;
import javax.inject.Inject;

public class DeviceClientAndroidImpl extends DeviceClientImpl {

  @Inject
  public DeviceClientAndroidImpl(
      PortableJsonParser jsonParser,
      ArcsEnvironment environment,
      PecPortManager pecPortManager,
      UiBroker uiBroker) {
    super(jsonParser, environment, pecPortManager, uiBroker);
  }

  @JavascriptInterface
  @Override
  public void receive(String json) {
    try {
      super.receive(json);
    } catch (Throwable e) {
      Log.e("Arcs", "Got an exception receiving " + json, e);
    }
  }
}
