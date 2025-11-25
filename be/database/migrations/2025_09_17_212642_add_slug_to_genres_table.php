<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1) Nếu chưa có cột slug, thêm cột nullable (không unique)
        if (!Schema::hasColumn('genre', 'slug')) {
            Schema::table('genre', function (Blueprint $table) {
                $table->string('slug')->nullable()->after('genre_name');
            });
        }

        // 2) Điền slug cho dữ liệu cũ, đảm bảo duy nhất
        DB::table('genre')->orderBy('id')->chunk(100, function ($rows) {
            foreach ($rows as $row) {
                $name = $row->genre_name ?? '';
                // tạo slug chuẩn từ tên (nếu name rỗng, dùng fallback)
                $base = Str::slug($name);
                if (empty($base)) {
                    $base = 'genre-' . $row->id;
                }

                // đảm bảo slug duy nhất: nếu đã tồn tại cho id khác thì thêm hậu tố
                $slug = $base;
                $i = 1;
                while (
                    DB::table('genre')
                    ->where('slug', $slug)
                    ->where('id', '!=', $row->id)
                    ->exists()
                ) {
                    $slug = $base . '-' . $i;
                    $i++;
                }

                DB::table('genre')->where('id', $row->id)->update(['slug' => $slug]);
            }
        });

        // 3) Bảo đảm tất cả slug đã không rỗng (nếu có bản ghi rỗng, update bằng id)
        DB::table('genre')->whereNull('slug')->orWhere('slug', '')->orderBy('id')->chunk(100, function ($rows) {
            foreach ($rows as $row) {
                $fallback = 'genre-' . $row->id;
                DB::table('genre')->where('id', $row->id)->update(['slug' => $fallback]);
            }
        });

        // 4) Thêm unique index sau khi đã populate (nếu chưa có)
        // Nếu gặp lỗi ở bước này thì chắc vẫn còn trùng — kiểm tra dữ liệu.
        $hasIndex = DB::select("SHOW INDEX FROM `genre` WHERE Key_name = 'genre_slug_unique'");
        if (empty($hasIndex)) {
            Schema::table('genre', function (Blueprint $table) {
                $table->unique('slug', 'genre_slug_unique');
            });
        }

        // (Tùy chọn) 5) Nếu bạn muốn slug NOT NULL, cần doctrine/dbal để change() column
        // composer require doctrine/dbal
        // Schema::table('genre', function (Blueprint $table) {
        //     $table->string('slug')->nullable(false)->change();
        // });
    }

    public function down(): void
    {
        if (Schema::hasColumn('genre', 'slug')) {
            Schema::table('genre', function (Blueprint $table) {
                // drop index trước nếu có
                if (Schema::hasColumn('genre', 'slug')) {
                    $table->dropUnique('genre_slug_unique');
                }
                $table->dropColumn('slug');
            });
        }
    }
};
