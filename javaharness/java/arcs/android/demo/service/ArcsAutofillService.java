package arcs.android.demo.service;

import android.app.assist.AssistStructure;
import android.app.assist.AssistStructure.ViewNode;
import android.os.CancellationSignal;
import android.service.autofill.AutofillService;
import android.service.autofill.FillCallback;
import android.service.autofill.FillContext;
import android.service.autofill.FillRequest;
import android.service.autofill.SaveCallback;
import android.service.autofill.SaveRequest;
import android.widget.RemoteViews;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import javax.inject.Inject;

import arcs.api.ArcData;
import arcs.api.Arcs;
import arcs.api.UiBroker;

/**
 * Demo implementation of an {@link AutofillService} for Arcs. This service retrieves Autofill
 * suggestions from Arcs, and makes them available on Android.
 */
public class ArcsAutofillService extends AutofillService {

  @Inject Arcs arcs;
  @Inject UiBroker uiBroker;
  AutofillRenderer autofillRenderer;

  @Override
  public void onCreate() {
    super.onCreate();

    DaggerArcsAutofillServiceComponent.builder()
        .appContext(getApplicationContext())
        .build()
        .inject(this);

    autofillRenderer = ((AutofillRenderer) uiBroker.getRenderer("autofill"));
  }

  @Override
  public void onFillRequest(
      FillRequest request, CancellationSignal cancellationSignal, FillCallback callback) {
    List<FillContext> fillContexts = request.getFillContexts();
    AssistStructure structure = fillContexts.get(fillContexts.size() - 1).getStructure();
    List<ViewNode> nodes = collectViewNodes(structure);

    // Find which view the user has focused on.
    Optional<ViewNode> node = nodes.stream().filter(ViewNode::isFocused).findAny();

    if (!node.isPresent()) {
      callback.onSuccess(null);
      return;
    }

    AutofillParticle autofillParticle = new AutofillParticle(node.get());
    ArcData arcData = arcs.runArc("AndroidAutofill", autofillParticle);

    autofillRenderer.addCallback(
        arcData.getProvidedSlotId(),
        node.get().getAutofillId(),
        fillResponse -> {
          callback.onSuccess(fillResponse);
          arcs.stopArc(arcData);
        });
  }

  @Override
  public void onSaveRequest(SaveRequest request, SaveCallback callback) {}

  private RemoteViews createRemoteView(String contents) {
    RemoteViews view = new RemoteViews(getPackageName(), R.layout.autofill_result);
    view.setTextViewText(R.id.autofill_result_text, contents);
    return view;
  }

  private static List<ViewNode> collectViewNodes(AssistStructure structure) {
    ArrayList<ViewNode> result = new ArrayList<>();

    int numNodes = structure.getWindowNodeCount();
    for (int i = 0; i < numNodes; i++) {
      ViewNode node = structure.getWindowNodeAt(i).getRootViewNode();
      collectViewNodes(node, result);
    }

    return result;
  }

  private static void collectViewNodes(ViewNode node, ArrayList<ViewNode> result) {
    result.add(node);

    int numChildren = node.getChildCount();
    for (int i = 0; i < numChildren; i++) {
      collectViewNodes(node.getChildAt(i), result);
    }
  }
}
