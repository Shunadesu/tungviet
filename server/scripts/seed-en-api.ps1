$token = ""
$base = "http://localhost:9007"

$loginBody = '{"email":"admin@zuna.vn","password":"admin123"}'
$loginRes = Invoke-WebRequest -Uri "$base/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -UseBasicParsing
$loginJson = $loginRes.Content | ConvertFrom-Json
$token = $loginJson.data.token
$authHeaders = @{ "Content-Type" = "application/json"; "Authorization" = "Bearer $token" }

Write-Host "Logged in"

function Update-Item($uri, $body) {
    $json = $body | ConvertTo-Json -Depth 5
    Invoke-WebRequest -Uri $uri -Method PUT -Body $json -Headers $authHeaders -UseBasicParsing | Out-Null
}

# Categories
$catEnMap = [ordered]@{
    "Cay Canh Trong Nha" = @{ original = "C" + ([char]0x00e2) + "y C" + ([char]0x1ea3)nh Trong Nh" + ([char]0x00e0); nameEn = "Indoor Ornamental Plants"; descriptionEn = "Various ornamental plants suitable for growing indoors" }
}

# Simpler: just loop and update based on category.name match
$cats = Invoke-WebRequest -Uri "$base/api/admin/categories?limit=100" -Headers $authHeaders -UseBasicParsing
$catData = ($cats.Content | ConvertFrom-Json).data

$catTrans = @{
    [char]0x00e2 + "y C" + [char]0x1ea3 + "nh Trong Nh" + [char]0x00e0 = "Indoor Ornamental Plants"
    [char]0x00e2 + "y C" + [char]0x1ea3 + "nh Ngo" + [char]0x00e0 + "i Tr" + [char]0x1eddi = "Outdoor Ornamental Plants"
    [char]0x00e2 + "y " + [char]0x1eb7 + "n Qu" + [char]0x1ea3 = "Fruit Trees"
    [char]0x00e2 + "y Hoa" = "Flowering Plants"
    "Ph" + [char]0x00e2 + "n B" + [char]0x00f3 + "n & Ch" + [char]0x0103 + "m S" + [char]0x00f3 + "c" = "Fertilizers & Plant Care"
}

$catDescEn = @{
    "Indoor Ornamental Plants" = "Various ornamental plants suitable for growing indoors"
    "Outdoor Ornamental Plants" = "Ornamental plants for garden and yard"
    "Fruit Trees" = "Trees that produce edible fruits"
    "Flowering Plants" = "All kinds of flowering plants"
    "Fertilizers & Plant Care" = "Fertilizers, pesticides, and plant care tools"
}

$catUpdated = 0
foreach ($c in $catData) {
    $enName = $catTrans[$c.name]
    if (-not $enName) { Write-Host "Skip cat (no mapping): $($c.name)"; continue }
    $body = @{
        name = $c.name
        nameEn = $enName
        description = $c.description
        descriptionEn = $catDescEn[$enName]
        imageUrl = $c.imageUrl
        isActive = $c.isActive
    }
    Update-Item "$base/api/admin/categories/$($c._id)" $body
    $catUpdated++
    Write-Host "Updated category: $($c.name) -> $enName"
}
Write-Host "Categories updated: $catUpdated"

# Products
$prods = Invoke-WebRequest -Uri "$base/api/admin/products?limit=100" -Headers $authHeaders -UseBasicParsing
$prodData = ($prods.Content | ConvertFrom-Json).data

$prodEnMap = [ordered]@{}
$prodEnMap[[char]0x00e2 + "y Kim Ng" + [char]0x00e2 + "n"] = @{
    nameEn = "Money Tree (Pachira)"
    descriptionEn = "The Money Tree is a popular feng shui plant that brings wealth and good fortune. Easy to care for, perfect for indoor spaces."
}
$prodEnMap[[char]0x00e2 + "y " + [char]0x0110 + [char]0x1ea1 + "i Ti" + [char]0x1ec7 + "n"] = @{
    nameEn = "Aglaonema"
    descriptionEn = "Aglaonema features large round green leaves, purifying the air and adding freshness to your living space."
}
$prodEnMap[[char]0x00e2 + "y Tr" + [char]0x1ea7 + "u B" + [char]0x00e0] = @{
    nameEn = "Golden Pothos"
    descriptionEn = "Golden Pothos is a climbing plant that is easy to grow and has excellent air-purifying abilities. Great for balconies and skylights."
}
$prodEnMap[[char]0x00e2 + "y L" + [char]0x01b0 + [char]0x1ee1 + "i H" + [char]0x1ed5] = @{
    nameEn = "Snake Plant"
    descriptionEn = "Snake Plant has sturdy upright leaves and is very low-maintenance. It purifies air and absorbs formaldehyde."
}
$prodEnMap[[char]0x00e2 + "y B" + [char]0x00e0 + "ng Singapore"] = @{
    nameEn = "Fiddle Leaf Fig"
    descriptionEn = "Fiddle Leaf Fig has lush green foliage and a beautiful upright trunk. Ideal for indoor spaces with moderate light."
}
$prodEnMap[[char]0x00e2 + "y Cau C" + [char]0x1ea3 + "nh"] = @{
    nameEn = "Areca Palm"
    descriptionEn = "Areca Palm brings a tropical vibe, perfect for living rooms and offices. Low-maintenance and boosts oxygen levels."
}
$prodEnMap[[char]0x00e2 + "y Phong Lan"] = @{
    nameEn = "Orchid"
    descriptionEn = "Orchids with vibrant beautiful blooms, ideal for decorating balconies and gardens. Available in many colors."
}
$prodEnMap[[char]0x00e2 + "y H" + [char]0x1ed3 + "ng M" + [char]0x00f4 + "n"] = @{
    nameEn = "Anthurium"
    descriptionEn = "Anthurium with red or pink heart-shaped flowers symbolizes love and happiness. Great indoor air purifier."
}
$prodEnMap[[char]0x00e2 + "y C" + [char]0x1ea9 + "m C" + [char]0x00f9] = @{
    nameEn = "Hoya"
    descriptionEn = "Hoya has thick glossy green leaves and tiny beautiful flowers. The plant absorbs electronic radiation well."
}
$prodEnMap[[char]0x00e2 + "y X" + [char]0x01b0 + [char]0x01a1 + "ng R" + [char]0x1ed3 + "ng"] = @{
    nameEn = "Cactus"
    descriptionEn = "Various cactus species, easy to care for, low water needs. Perfect for desks and windowsills."
}
$prodEnMap[[char]0x00e2 + "y Nho"] = @{
    nameEn = "Grape Vine"
    descriptionEn = "Grape vine produces sweet fruits and can be grown in gardens or large pots. Provides shade and harvest."
}
$prodEnMap[[char]0x00e2 + "y B" + [char]0x01b0 + [char]0x1edfi] = @{
    nameEn = "Pomelo Tree"
    descriptionEn = "Pomelo tree produces large juicy fruits. Planted in gardens for shade and clean home-grown fruit."
}
$prodEnMap[[char]0x00e2 + "y Mai V" + [char]0x00e0 + "ng"] = @{
    nameEn = "Apricot Blossom"
    descriptionEn = "Apricot Blossom is the iconic Tet holiday flower with radiant yellow blooms. Grown outdoors with plenty of sunlight."
}
$prodEnMap[[char]0x00e2 + "y T" + [char]0x00f9 + "ng La H" + [char]0x00e1 + "n"] = @{
    nameEn = "Buddhist Pine"
    descriptionEn = "Buddhist Pine is a small woody plant with a beautiful shape. Often potted for decoration, symbolizing longevity."
}
$prodEnMap["Ph" + [char]0x00e2 + "n B" + [char]0x00f3 + "n NPK"] = @{
    nameEn = "NPK Fertilizer"
    descriptionEn = "Balanced NPK fertilizer for all plants. Suitable for ornamentals, vegetables, and flowers. 1kg package."
}
$prodEnMap[[char]0x0110 + [char]0x1ea5 + "t Tr" + [char]0x1ed3 + "ng C" + [char]0x00e2 + "y"] = @{
    nameEn = "Potting Soil"
    descriptionEn = "High-quality nutrient-rich potting soil. Ideal for ornamentals, vegetables, and flowers. 5kg bag."
}
$prodEnMap[[char]0x00e2 + "y Thi" + [char]0x1ebf + "t M" + [char]0x1ed9 + "c Lan"] = @{
    nameEn = "Dracaena"
    descriptionEn = "Dracaena has long glossy green leaves. Excellent indoor air purifier."
}
$prodEnMap[[char]0x00e2 + "y Sanh"] = @{
    nameEn = "Ficus Bonsai"
    descriptionEn = "Ficus Bonsai is a popular bonsai with beautiful wood trunk and natural shape. Grown outdoors with regular watering."
}
$prodEnMap[[char]0x00e2 + "y H" + [char]0x01b0 + [char]0x01a1 + "ng Th" + [char]0x1ea3 + "o"] = @{
    nameEn = "Rosemary"
    descriptionEn = "Rosemary has a lovely fragrance and can be grown indoors or on balconies. Decorative and useful as a culinary herb."
}
$prodEnMap[[char]0x00e2 + "y Sen " + [char]0x0110 + [char]0x00e1] = @{
    nameEn = "Succulent"
    descriptionEn = "Various succulent species with beautifully arranged fleshy leaves. Easy to care for, perfect for desks and shelves."
}

$prodUpdated = 0
foreach ($p in $prodData) {
    $en = $prodEnMap[$p.name]
    if (-not $en) { Write-Host "Skip prod (no mapping): $($p.name)"; continue }
    $catId = $p.categoryId._id
    $body = @{
        name = $p.name
        nameEn = $en.nameEn
        description = $p.description
        descriptionEn = $en.descriptionEn
        price = $p.price
        stock = $p.stock
        categoryId = $catId
        imageUrl = $p.imageUrl
        isActive = $p.isActive
    }
    Update-Item "$base/api/admin/products/$($p._id)" $body
    $prodUpdated++
    Write-Host "Updated product: $($p.name) -> $($en.nameEn)"
}
Write-Host "Products updated: $prodUpdated"

Write-Host "DONE"