package arcs.android.impl;

import arcs.api.PortableJson;
import arcs.api.PortableJsonParser;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Objects;
import static org.junit.Assert.*;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

@RunWith(JUnit4.class)
public class PortableJsonAndroidImplTest {
  // TODO(cromwellian): use dependendency injection to make these tests run on all platforms
  @Test
  public void testEmpty() {
    PortableJsonParser parser = new PortableJsonParserAndroidImpl();
    PortableJson obj = parser.emptyObject();
    PortableJson arr = parser.emptyArray();
    assertEquals(0, obj.keys().size());
    assertEquals(0, arr.getLength());
  }

  @Test
  public void testObject() {
    PortableJsonParser parser = new PortableJsonParserAndroidImpl();
    PortableJson obj = parser.emptyObject();
    String str = "string";
    int i = 123;
    double num = 4.5;
    boolean bool = true;
    PortableJson innerObj = parser.parse("{\"foo\" : \"bar\"}");
    obj.put("str", str);
    obj.put("int", i);
    obj.put("num", num);
    obj.put("bool", bool);
    obj.put("obj", innerObj);

    assertEquals(
        new HashSet<>(Arrays.asList("str", "int", "num", "bool", "obj")),
        new HashSet<>(Arrays.asList(obj.keys().toArray())));

    assertEquals(str, obj.getString("str"));
    System.err.println("int is " + obj.getInt("int") + " vs " + i);
    assertEquals(i, obj.getInt("int"));
    assertEquals(num, obj.getNumber("num"), 2);
    assertEquals(bool, obj.getBool("bool"));
    assertEquals(innerObj, obj.getObject("obj"));
    assertEquals(parser.stringify(obj.getObject("obj")), parser.stringify(innerObj));

    assertEquals(obj, parser.parse(parser.stringify(obj)));
    assertEquals(
        parser.stringify(obj),
        parser.stringify(parser.parse(parser.stringify(obj))));

    assertNotSame(obj, innerObj);
    assertNotSame(innerObj, obj);
  }

  @Test
  public void testArray() {
    System.err.println("Hello");
    PortableJsonParser parser = new PortableJsonParserAndroidImpl();
    PortableJson obj = parser.emptyArray();
    String str = "string";
    int i = 123;
    double num = 4.5;
    boolean bool = true;
    PortableJson innerObj = parser.parse("{\"foo\" : \"bar\"}");
    obj.put(0, str);
    obj.put(1, i);
    obj.put(2, num);
    obj.put(3, bool);
    obj.put(4, innerObj);
    assertEquals(5, obj.getLength());
    assertEquals(str, obj.getString(0));
    assertEquals(i, obj.getInt(1));
    assertEquals(num, obj.getNumber(2), 2);
    assertEquals(bool, obj.getBool(3));
    assertEquals(parser.stringify(innerObj), parser.stringify(obj.getObject(4)));
    assertEquals(
        parser.stringify(obj),
        parser.stringify(parser.parse(parser.stringify(obj))));
    assertEquals(
        parser.parse(parser.stringify(obj)),
        parser.parse(parser.stringify(parser.parse(parser.stringify(obj)))));
    assertEquals(obj, parser.parse(parser.stringify(obj)));
    assertNotSame(obj, innerObj);
    assertNotSame(innerObj, obj);
  }
}
