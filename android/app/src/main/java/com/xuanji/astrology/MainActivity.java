package com.xuanji.astrology;

import android.os.Bundle;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Apply system status bar & navigation bar insets to prevent UI clipping/overlapping
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(android.R.id.content), (view, insets) -> {
            int statusBar = insets.getInsets(WindowInsetsCompat.Type.statusBars()).top;
            int navBar = insets.getInsets(WindowInsetsCompat.Type.navigationBars()).bottom;
            view.setPadding(0, statusBar, 0, navBar);
            return insets;
        });
    }
}
