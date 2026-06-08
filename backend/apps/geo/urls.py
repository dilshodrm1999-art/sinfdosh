from rest_framework.routers import DefaultRouter

from .views import ClassroomViewSet, DistrictViewSet, RegionViewSet, SchoolViewSet

router = DefaultRouter()
router.register("regions", RegionViewSet)
router.register("districts", DistrictViewSet)
router.register("schools", SchoolViewSet)
router.register("classrooms", ClassroomViewSet)

urlpatterns = router.urls
